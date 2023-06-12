use sha3::{Digest, Sha3_256};

use kyber_rs::group::edwards25519::SuiteEd25519;
use kyber_rs::util::random::RandStream;
use kyber_rs::group;
use kyber_rs::Point;
use kyber_rs::Scalar;
use kyber_rs::Group;
use serde::{Serialize, Deserialize};

use rocket::futures::io;

use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;
use hex;

// TODO: Change the attachment encryption algorithm, find something that is faster.

/// The payload struct contains the encrypted message and the public keys of the payload.
/// Each property is of type `Vec<group::edwards25519::Point>`.
#[derive(Serialize, Deserialize, Debug)]
pub struct Payload {
    pub binaries: Vec<group::edwards25519::Point>,
    pub public_keys: Vec<group::edwards25519::Point>,
}

/// The Ticket struct is a clear text object used to create the encrypted message. 
/// This object also contains methods responsible for creating the encrypted dead drop.
/// - title : The title of the dead drop.
/// - message : The the text of the dead drop.
/// - attachment : Users may attach a binary file. This is stored as a `[u8]` until encrypted.
/// - password : The password used to encrypt the dead drop.
/// - action : The action to be performed by the controller (CREATE, READ, UPDATE, DELETE). String must match CRUD exactly.
#[derive(Debug)]
pub struct Ticket{
    pub din: String,
    pub title: String,
    pub message: String,
    pub password: String,
    pub action: String,
    pub attachment: Vec<u8>,
}
/// The DeadDrop struct is an ecrypted object comprising of payloads and metadata.
/// - id : The id of the dead drop.
/// - title : The title of the dead drop.
/// - message : The text of the dead drop as a Payload.
/// - attachment : The binary file of the dead drop as a Payload.
#[derive(Debug)]
pub struct DeadDrop {
    pub id: String,
    pub title: String,
    pub message: Payload,
    pub attachment: Payload,
    // created_at: DateTime<Utc>,
    // updated_at: DateTime<Utc>,
}

/// The Ticket is an object created on behalf of the client. 
/// This object contains all the information needed to create a dead drop. 
/// Methods within contain the cryptographic logic to generate the dead drop.
/// > NOTE: The instanciated ticket must be mutable. This is because the ticket will generate a din if none is provided.
/// Example Implementation:
/// ```
///     let mut test_ticket = Ticket::new(
///        req.din,
///        req.title,
///        req.message,
///        req.password,
///        req.action,
///        req.attachment,
///    );
///    let dead_drop = test_ticket.generate_deaddrop();
///    println!("dead_drop: {:?}", dead_drop);
/// ```
/// 
    
impl Ticket {
    //construct the ticket from the struct
    pub fn new(din: String, title: String, message: String, password: String, action: String, attachment: Vec<u8>) -> Ticket {
        Ticket {
            din: din,
            title: title,
            message: message,
            password: password,
            action: action,
            attachment: attachment,
        }
    }


    /// The `generate_deaddrop` method gnerates an encrypted dead drop from the properties of the ticket.
    pub fn generate_deaddrop(&mut self) -> DeadDrop {
        // generate the id
        let id = self.generate_id();
        // generate the payloads
        let (message, attachment) = self.generate_payload(&self.message, &self.attachment);
        // let attachment = self.attachment_payload(self.attachment);
        // generate the dead drop
        let dead_drop = DeadDrop {
            id: id,
            title: self.title.clone(),
            message: message,
            attachment: attachment,
        };
        // return the dead drop
        return dead_drop;
    }

    pub fn generate_id(&mut self) -> String {

        let mut new_din = self.din.clone();
        if self.din.is_empty() {
            new_din = thread_rng()
                .sample_iter(&Alphanumeric)
                .take(5)
                .map(char::from)
                .collect();
            self.din = new_din.clone();
        }

        // TODO: Make this a config variable.
        let salt = "SALT".to_string();
        let mashed = format!("{}{}{}", new_din, self.password, salt);

        let mut hasher = Sha3_256::new();
        hasher.update(mashed);
        let hashed = hex::encode(hasher.finalize());
        return String::from(hashed);
    }

    /// The `generate_payload` method generates a payload from a string.
    fn generate_payload(&self, msg: &String, att: &Vec<u8> ) -> (Payload, Payload) {
        // Generate hash of password
        let mut hasher = Sha3_256::new();
        hasher.update(self.password.clone());
        let password = hasher.finalize();
        // Generate keys
        let suite: SuiteEd25519 = SuiteEd25519::new_blake3_sha256_ed25519();
        let private_key: group::edwards25519::Scalar = suite.scalar().set_bytes(&password);
        let public_key: group::edwards25519::Point = suite.point().mul(&private_key, None); 

        // Instanciate Vectors to store the encryption types.
        let mut msg_remainder: Vec<u8> = msg.as_bytes().to_vec();
        let mut msg_encrypted: Vec<group::edwards25519::Point> = Vec::new();
        let mut msg_ephemeral_keys: Vec<group::edwards25519::Point> = Vec::new();
        // Encrypt the message one block at a time, push both the ephemeral key and the cipher text to the respective vectors.
        while msg_remainder.len() > 0 {
            let (ephmeral_key, cipher_text, remainder_temp) = Ticket::encrypt(suite, &public_key, &msg_remainder);
            msg_remainder = remainder_temp;
        
            msg_encrypted.push(cipher_text);
            msg_ephemeral_keys.push(ephmeral_key);
        }

        let mut att_remainder: Vec<u8> = att.to_vec();
        let mut att_encrypted: Vec<group::edwards25519::Point> = Vec::new();
        let mut att_ephemeral_keys: Vec<group::edwards25519::Point> = Vec::new();
        while att_remainder.len() > 0 {
            println!("att_remainder: {:?}", att_remainder.len());
            let (ephmeral_key, cipher_text, remainder_temp) = Ticket::encrypt(suite, &public_key, &att_remainder);
            att_remainder = remainder_temp;
        
            att_encrypted.push(cipher_text);
            att_ephemeral_keys.push(ephmeral_key);
        }

        // generate the payload
        let message = Payload {
            binaries: msg_encrypted.clone(),
            public_keys: msg_ephemeral_keys.clone(),
        };
        let attachment = Payload {
            binaries: att_encrypted.clone(),
            public_keys: att_ephemeral_keys.clone(),
        };
        // return the payload
        return (message, attachment);
    }

    fn encrypt<GROUP: Group>(
        group: GROUP,
        pubkey: &GROUP::POINT,
        data: &[u8],
    ) -> (GROUP::POINT, GROUP::POINT, Vec<u8>) {
        // Embed the data (or as much of it as will fit) into a curve point.
        let data_slice = group
            .point()
            .embed(Some(data), &mut RandStream::default());
        let mut max: usize = group.point().embed_len();
        if max > data.len() {
            max = data.len()
        }
        let remainder = data[max..].to_vec();
        // ElGamal-encrypt the point to produce ciphertext (K,C).
        let ephemeral_private= group.scalar().pick(&mut RandStream::default()); // ephemeral private key
        let ephemeral_public = group.point().mul(&ephemeral_private, None); // ephemeral DH public key
        let secret = group.point().mul(&ephemeral_private, Some(pubkey)); // ephemeral DH shared secret
        let cypher_text = secret.clone().add(&secret, &data_slice); // data blinded with secret
        (ephemeral_public, cypher_text, remainder)
    }


}

impl DeadDrop {
    pub fn new(id: String, title: String, message: Payload, attachment: Payload) -> DeadDrop {
        DeadDrop {
            id: id,
            title: title,
            message: message,
            attachment: attachment,
        }
    }
    pub fn generate_ticket(&self, password: String) -> Result<Ticket, io::Error> {
        // generate the ticket
        let ticket = Ticket {
            din: self.id.clone(),
            title: self.title.clone(),
            message: self.message_decrypt(password.clone()),
            attachment: self.attachment_decrypt(password),
            action: "".to_string(),
            password: "".to_string(),
        };
        // return the ticket
        return Ok(ticket); 
    }

    /// The `msg_decrypt` method decrypts the dead drop message and returns a string.
    fn message_decrypt(&self, password: String) -> String {

        // Generate a hash from a password to decrypt the message.
        let mut hasher = Sha3_256::new();
        hasher.update(password); 
        let password_hash = hasher.finalize();
        
        // Instanciate required objects and variables
        // let dead_drop: Ticket = bincode::deserialize(&ticket_binary).unwrap(); // Deserialized from binary stream.
        let suite: SuiteEd25519 = SuiteEd25519::new_blake3_sha256_ed25519(); 
        let private_key: group::edwards25519::Scalar = suite.scalar().set_bytes(&password_hash); // Generate decryption key
        let mut decrypted_msg: Vec<u8> = Vec::new();

        // Decrypt the message one block at a time, push the decrypted message to the decrypted_msg vector.
        for i in 0..self.message.binaries.len() {
            let dec_res = DeadDrop::decrypt(suite, &private_key, self.message.public_keys[i], self.message.binaries[i]);
            match dec_res {
                Ok(decrypted) => {
                    for i in 0..decrypted.len() {
                        decrypted_msg.push(decrypted[i]);
                    }
                },           
                Err(err) => println!("Decryption failed: {:?}", err),
            }
        }
        return String::from_utf8(decrypted_msg).unwrap();
    }

    fn attachment_decrypt(&self, password: String) -> Vec<u8> {
        
        // Generate a hash from a password to decrypt the message.
        let mut hasher = Sha3_256::new();
        hasher.update(password); 
        let password_hash = hasher.finalize();
        
        // Instanciate required objects and variables
        // let dead_drop: Ticket = bincode::deserialize(&ticket_binary).unwrap(); // Deserialized from binary stream.
        let suite: SuiteEd25519 = SuiteEd25519::new_blake3_sha256_ed25519(); 
        let private_key: group::edwards25519::Scalar = suite.scalar().set_bytes(&password_hash); // Generate decryption key
        let mut decrypted_file: Vec<u8> = Vec::new();

        // Decrypt the message one block at a time, push the decrypted message to the decrypted_msg vector.
        for i in 0..self.attachment.binaries.len() {
            let dec_res = DeadDrop::decrypt(
                suite, 
                &private_key, 
                self.attachment.public_keys[i], 
                self.attachment.binaries[i]);
            match dec_res {
                Ok(decrypted) => {
                    for i in 0..decrypted.len() {
                    decrypted_file.push(decrypted[i]);
                    }
                },           
                Err(err) => println!("Decryption failed: {:?}", err),
            }
        }
        return decrypted_file;
    }

    fn decrypt<GROUP: Group>(
        group: GROUP,
        prikey: &<GROUP::POINT as Point>::SCALAR,
        ephemeral_key: GROUP::POINT,
        cipher_text: GROUP::POINT,
    ) -> Result<Vec<u8>, group::PointError> {
        // ElGamal-decrypt the ciphertext (K,C) to reproduce the message.
        let secret = group.point().mul(prikey, Some(&ephemeral_key)); // regenerate shared secret
        let point = group.point();
        let message = point.sub(&cipher_text, &secret); // use to un-blind the message
        return message.data();
    }
}

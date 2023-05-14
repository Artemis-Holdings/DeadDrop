require("dotenv").config();
const crypto = require('crypto');
const {Buffer} = require('buffer');

const algorithm = 'aes-192-cbc';
const iv = Buffer.alloc(16, 0);
const inputEncoding = 'utf8';
const storageEncoding = 'hex';


/*
 * MANAGES ALL ENCRYPTION AND DECRYPTION OF MESSAGES
 * Password is passed in as un-hashed
 */

class DeadDropEncryption {
    constructor(){

    }

    test (msg='default'){
        return `test ${msg}`
    }

        // TODO: Implement Error handeling
    static async encrypt(payload, password){
       
        let encryptPromise = new Promise((resolve, reject) => {
            
            crypto.scrypt(password, 'salt', 24, (err, key) => {
                if (err) throw err;
            
                  const cipher = crypto.createCipheriv(algorithm, key, iv);
              
                  let encrypted = cipher.update(payload, inputEncoding, storageEncoding);
                  encrypted += cipher.final(storageEncoding);
                //   reject('unable to encrypt');
    
                  resolve(encrypted);
              });
             
          });
        
        return await encryptPromise;
    }

    static async decrypt(payload, password){
    
        let decryptPromise = new Promise((resolve, reject) => {
    
            crypto.scrypt(password, 'salt', 24, (err, key) => {
                if (err) throw err;

                  const decipher = crypto.createDecipheriv(algorithm, key, iv);
              
                  let decrypted = decipher.update(payload, storageEncoding, inputEncoding);
                  decrypted += decipher.final(inputEncoding);
                
                  resolve(decrypted);
               
              });
              
          });
        
        return await decryptPromise;
    }


}

module.exports = {
    DeadDropEncryption
  };
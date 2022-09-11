require("dotenv").config();
const fileUpload = require("express-fileupload");
const { BlobServiceClient } = require("@azure/storage-blob");

const knex = require("./dbConnection.js");


// const crypto = require("crypto");
// const algorithm = "aes-192-cbc";
// const initVector = crypto.randomBytes(24).toString("hex").slice(0, 16);
function randInt(max) {
  return Math.floor(Math.random() * max);
}

class DeadDropControlers {
  constructor(){

  }
  randInt(max) {
    return Math.floor(Math.random() * max);
  }

  static async azureRecallDeadDrop(integrityHash){
  
    // bring in the connection string
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const token = process.env.AZURE_SAS_TOKEN;
  
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw Error("Azure Storage Connection string not found");
    }
    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
  
    // Create a unique name for the container
    const containerName = integrityHash  ;
    const containerClient = blobServiceClient.getContainerClient(containerName);
  
      let blobNameArray = [];
    // List the blob(s) in the container.
    for await (const blob of containerClient.listBlobsFlat()) {
    
      blobNameArray.push(blob.name);
    }

  
    const base = "https://blobteststorageacct.blob.core.windows.net/";
  
    let blobLinkArray = [];
    for (let blob of blobNameArray){
      let url = `${base}${containerName}/${blob}${token}`;
      blobLinkArray.push(url); 
    }
 
    
    return {"nameArray" : blobNameArray, "uriArray" : blobLinkArray};
  }


  static async azureNewDeadDrop(integrityHash, payload){
  
    // bring in the connection string
    const AZURE_STORAGE_CONNECTION_STRING =
      process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw Error("Azure Storage Connection string not found");
    }

    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
  
    // Create a unique name for the container
    const containerName = integrityHash  ;

  
    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Create the container
    const createContainerResponse = await containerClient.create();
    console.log(
      "Container was created successfully. requestId: ",
      createContainerResponse.requestId
    );
  
    // Create a unique name for the blob
    const blobName = payload.name;
  
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    // Upload data to the blob
    const data = payload.data;
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(
      "Azure Blob requestId: ",
      uploadBlobResponse.requestId
    );
  
  }


  /* 
   * CREATE DEAD DROP MESSAGE
   * I: Integrity Hash and Password Hash
   * O: Void method places a new entry in the dead_drop table for managing encrypted states.
   */
  static createDeadDrop(integrityHash, passwordHash) {
    return knex("dead_drop").insert({
      integ_hash: integrityHash,
      pass_hash: passwordHash,
    });
  }

  /* 
   * GET PASSWORD HASH
   * I: the Integrity Hash to search for
   * O: Returns Password Hash associated with the Integrity Hash (aka id)
   * USAGE: Compare the password to the hash in APP to leverage bcrypt
   */
  static recallPasswordHash(searchHash) {
    try {
      return knex("dead_drop")
        .where({ integ_hash: searchHash })
        .select("pass_hash")
        .then((data) => {
          try {
            return data[0].pass_hash;
          } catch (error) {
            return 410 ;
          }
        });
    } catch (error) {
      console.log(error)
      return 410 ;
    }

  };

  /* 
   * Save New Message
   * I: encrypted Data & integrityHash
   * O: VOID. Saves the data to the database.
   * USAGE: Only use for new messages. This will not update a previous message.
   */
  static saveNewMsg(encryptedData, integrityHash){
    // TODO: Emplement encryption encoding
    return knex("messages").insert({
      message: encryptedData,
      integ_hash: integrityHash,
    });
  };

  /* 
   * Recall Encrypted Message
   * I: integrity hash
   * O: Encrypted message.
   * USAGE: retrireves an encrypted message from the database
   */
  static recallEncryptedMsg(integrityHash) {
    return knex("messages")
      .where({ integ_hash: integrityHash })
      .select("message")
      .then((data) => data[0].message);
  }

  /* 
   * Delete Message
   * I: integrity hash
   * O: VOID
   * USAGE: 
   */
  static deleteMsg(integrityHash) {
    // TODO: Create way to prevent unauthorized usage
    return knex("messages")
      .where({ integ_hash: integrityHash })
      .del();
  }


  /* 
   * Delete Dead Drop
   * I: integrity hash
   * O: VOID
   * USAGE: 
   */
  static deleteDrop(integrityHash) {
    // TODO: Create way to prevent unauthorized usage
    return knex("dead_drop")
      .where({ integ_hash: integrityHash })
      .del();
  }

  /* 
   * Update Password
   * I: integrity hash
   * O: VOID
   * USAGE: 
   */
  static updatePassword(integrityHash, update) {
    return knex("dead_drop")
      .where({ integ_hash: integrityHash })
      .update({ pass_hash : update });
  }


  /* 
   * Update Message
   * I: integrity hash
   * O: VOID
   * USAGE: 
   */
  static updateMsg(integrityHash, update) {
    return knex("messages")
      .where({ integ_hash : integrityHash })
      .update({ message : update });
  }

  ///// AZURE BLOB
  // static async azureNewDeadDrop(integrityHash, payload){
  //   // bring in the connection string
  //   const AZURE_STORAGE_CONNECTION_STRING =
  //     process.env.AZURE_STORAGE_CONNECTION_STRING;
  //   if (!AZURE_STORAGE_CONNECTION_STRING) {
  //     throw Error("Azure Storage Connection string not found");
  //   }
  
  //   // Create the BlobServiceClient object which will be used to create a container client
  //   const blobServiceClient = BlobServiceClient.fromConnectionString(
  //     AZURE_STORAGE_CONNECTION_STRING
  //   );
  
  //   // Create a unique name for the container
  //   const containerName = integrityHash + getRandomInt(50) ;
  
  //   console.log("\nCreating container...");
  //   console.log("\t", containerName);
  
  //   // Get a reference to a container
  //   const containerClient = blobServiceClient.getContainerClient(containerName);
  //   // Create the container
  //   const createContainerResponse = await containerClient.create();
  //   console.log(
  //     "Container was created successfully. requestId: ",
  //     createContainerResponse.requestId
  //   );
  
  //   // Create a unique name for the blob
  //   const blobName = payload.name;
  
  //   // Get a block blob client
  //   const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  //   console.log("\nUploading to Azure storage as blob:\n\t", blobName);
  
  //   // Upload data to the blob
  //   const data = payload.data;
  //   const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
  //   console.log(
  //     "Blob was uploaded successfully. requestId: ",
  //     uploadBlobResponse.requestId
  //   );
  
  // }

}

module.exports = {
  DeadDropControlers
};


/*
const {
  scrypt,
  randomFill,
  createCipheriv
} = await import('crypto');

const algorithm = 'aes-192-cbc';
const password = 'Password used to generate key';

// First, we'll generate the key. The key length is dependent on the algorithm.
// In this case for aes192, it is 24 bytes (192 bits).
scrypt(password, 'salt', 24, (err, key) => {
  if (err) throw err;
  // Then, we'll generate a random initialization vector
  randomFill(new Uint8Array(16), (err, iv) => {
    if (err) throw err;

    const cipher = createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log(encrypted);
  });
});

*/

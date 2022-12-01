// ref: https://www.section.io/engineering-education/data-encryption-and-decryption-in-node-js-using-crypto/
// ref: https://nodejs.org/api/crypto.html
// ref: https://medium.com/zero-equals-false/using-cors-in-express-cac7e29b005b

// IMPORT PACKAGES
// require("dotenv").config();
const path = require('path');
const express = require("express");
const morgan = require("morgan");
const { hash, compare } = require("bcryptjs");
const cors = require("cors");
const fileUpload = require("express-fileupload");
// const { BlobServiceClient } = require("@azure/storage-blob");
// const { v1: uuidv1 } = require("uuid");

// CUSTOM IMPORTS
const { DeadDropControlers } = require("./controllers");
const { DeadDropEncryption } = require("./src");
// const { blob } = require("node:stream/consumers");

// INIT MIDDLE WARE
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(express.static(path.join(__dirname, ".." ,"client", "build")));

const saltRounds = 12;


function randInt(max) {
  return Math.floor(Math.random() * max);
}

// END POINTS
app.get("/", (req, res) => {
  res.send(`Dead Drop Online`);
});

// MESSAGE :POST - Create a new message
app.post("/message", (req, res) => {
  let { payload, password } = req.headers;

  if (!payload) {
    res
      .status(401)
      .json({
        output: "null payload is unauthorized",
        payload: "",
        password: "",
      });
  } else if (!password) {
    res
      .status(401)
      .json({
        output: "null password is unauthorized",
        payload: "",
        password: "",
      });
  } else {
    // hash the password and payload
    hash(password, saltRounds).then((passwordHash) => {
      hash(payload, saltRounds).then((integrityHash) => {
        // create the dead drop
        DeadDropControlers.createDeadDrop(integrityHash, passwordHash)
          .then((data) => {
            // ENCRYPT
            DeadDropEncryption.encrypt(payload, password).then(
              (encryptedData) => {
                DeadDropControlers.saveNewMsg(
                  encryptedData,
                  integrityHash
                ).then((data) => {
                  res.status(201).json({ msg_id: integrityHash });
                });
              }
            );
          })
          .catch((err) => {
            res.status(501).json(err);
          });
      });
    });
  }
});

// MESSAGE :PUT - modify a previously created dead drop

app.patch("/message", (req, res) => {
  const { msg_id, password, update, option } = req.headers;

  const integrityHash = msg_id;

  if (!msg_id || !password || !update || !option) {
    res
      .status(401)
      .json({
        output: "null is unauthorized",
        msg_id: "",
        password: "",
        update: "",
        option: "",
      });
  } else {
    // Validate password and hash match
    DeadDropControlers.recallPasswordHash(integrityHash).then(
      (hashedPassword) => {
        compare(password, hashedPassword)
          .then((isMatch) => {
            if (isMatch) {
              // PRIMARY WORK HERE
              // update password
              if (option === "pas") {
                hash(update, saltRounds).then((newHash) => {
                  // update password on db with new hash
                  DeadDropControlers.updatePassword(
                    integrityHash,
                    newHash
                  ).then(() => {
                    // recall encrypted message
                    DeadDropControlers.recallEncryptedMsg(integrityHash).then(
                      (encryptedMsg) => {
                        // decrypt data
                        DeadDropEncryption.decrypt(encryptedMsg, password).then(
                          (decryptedMsg) => {
                            // encrypt data
                            DeadDropEncryption.encrypt(
                              decryptedMsg,
                              update
                            ).then((updatedData) => {
                              // save data
                              DeadDropControlers.updateMsg(
                                integrityHash,
                                updatedData
                              ).then(() => {
                                res
                                  .status(201)
                                  .json({
                                    output: "update complete",
                                    msg_id: integrityHash,
                                  });
                              });
                            });
                          }
                        );
                      }
                    );
                  });
                });
              }
              // update message
              else if (option === "msg") {
                DeadDropEncryption.encrypt(update, password).then(
                  (encryptedData) => {
                    DeadDropControlers.updateMsg(
                      integrityHash,
                      encryptedData
                    ).then((data) => {
                      res
                        .status(201)
                        .json({
                          output: "update complete",
                          msg_id: integrityHash,
                        });
                    });
                  }
                );
              }
              // error
              else {
                res
                  .status(406)
                  .json({
                    output: "option must either be 'msg' or 'pas' ",
                    msg_id: "",
                    password: "",
                    update: "",
                    option: "",
                  });
              }
            } else {
              res.status(401).json("unauthorized access");
            }
          })
          .catch((err) => {
            res.status(501).json(err);
          });
      }
    );
  }
});

// MESSAGE :DELETE - delete a previously created dead drop
app.delete("/message", (req, res) => {
  const { msg_id, password } = req.headers;

  const integrityHash = msg_id;
  if (!integrityHash) {
    res
      .status(401)
      .json({
        output: "null msg_id is unauthorized",
        msg_id: "",
        password: "",
      });
  } else if (!password) {
    res
      .status(401)
      .json({
        output: "null password is unauthorized",
        msg_id: "",
        password: "",
      });
  } else {
    DeadDropControlers.recallPasswordHash(integrityHash).then(
      (hashedPassword) => {
        compare(password, hashedPassword)
          .then((isMatch) => {
            if (isMatch) {
              // PRIMARY WORK HERE
              DeadDropControlers.deleteMsg(integrityHash).then(() => {
                DeadDropControlers.deleteDrop(integrityHash).then(() => {
                  res.status(201).json({ output: "Dead Drop Destroyed" });
                });
              });
            } else {
              res.status(401).json("unauthorized access");
            }
          })
          .catch((err) => {
            res.status(500).json(err);
          });
      }
    );
  }
});

// MESSAGE :GET - recall a previously created Dead Drop
app.get("/message", (req, res) => {
  // const { msg_id, password } = req.body;
  const { msg_id, password } = req.headers;

  const integrityHash = msg_id;
  if (!integrityHash) {
    res
      .status(401)
      .json({
        message: "null msg_id is unauthorized",
        msg_id: "",
        password: "",
      });
  } else if (!password) {
    res
      .status(401)
      .json({
        message: "null password is unauthorized",
        msg_id: "",
        password: "",
      });
  } else {
    DeadDropControlers.recallPasswordHash(integrityHash).then(
      (hashedPassword) => {
        if (hashedPassword === 410) {
          res.status(410).json({ msg_id: msg_id, message: "Dead Drop not found."});
        } else {
          compare(password, hashedPassword)
            .then((isMatch) => {
              if (isMatch) {
                // GET ENCRYPTED MESSAGE
                DeadDropControlers.recallEncryptedMsg(integrityHash).then(
                  (encryptedMsg) => {
                    // DECRYPT MESSAGE
                    DeadDropEncryption.decrypt(encryptedMsg, password).then(
                      (msg) => {
                        res.status(201).json({ msg_id: msg_id, message: msg });
                      }
                    );
                  }
                );
              } else {
                res.status(401).json("unauthorized access");
              }
            })
            .catch((err) => {
              res.status(501).json(err);
            });
        }
      }
    );
  }
});

// FILE
// FILE : GET dead-drop container : output array of content
// MESSAGE :GET - recall a previously created Dead Drop
// INPUT (headder) msg_id, password
app.get("/file", (req, res) => {
 
  const { msg_id, password } = req.headers;

  const integrityHash = msg_id;
  if (!integrityHash) {
    res
      .status(401)
      .json({
        output: "null msg_id is unauthorized",
        msg_id: "",
        password: "",
      });
  } else if (!password) {
    res
      .status(401)
      .json({
        output: "null password is unauthorized",
        msg_id: "",
        password: "",
      });
  } else {
    DeadDropControlers.recallPasswordHash(integrityHash).then(
      (hashedPassword) => {
        if (hashedPassword === 410) {
          res.status(410).json("dead drop not found");
        } else {
          compare(password, hashedPassword)
            .then((isMatch) => {
          
              if (isMatch) {
                  console.log("passwords match")
                // GET CONTENTS OF CONTAINER
                DeadDropControlers.azureRecallDeadDrop(integrityHash)
                .then( (data) => {res.status(201).json(data) } )
                .catch( (err) => res.status(501).json(err));


              } else {
                res.status(401).json("unauthorized access");
              }
            })
            .catch((err) => {
              res.status(501).json(err);
            });
        }
      }
    );
  }
});





// FILE :POST - Create a new file Dead Drop
app.post("/file", (req, res) => {
  // Destructure header
  const payload = req.files.input;
  console.log(payload);

  let { password } = req.headers;

  // Valildate inputs
  if (!payload) {
    res
      .status(401)
      .json({
        output: "null payload is unauthorized",
        payload: "",
        password: "",
      });
  } else if (!password) {
    res
      .status(401)
      .json({
        output: "null password is unauthorized",
        payload: "",
        password: "",
      });
  } else {
    // hash the password and payload
    hash(password, saltRounds).then((passwordHash) => {
      // NOTE: need to use md5 for azure requirements  
      integrityHash = payload.md5 + randInt(999);

        // create the dead drop
        DeadDropControlers.createDeadDrop(integrityHash, passwordHash)
          .then((data) => {
          
              // create a container and save the file to blob
              DeadDropControlers.azureNewDeadDrop(integrityHash, payload)
                .then( () => {res.status(201).json({"msg_id" : integrityHash})})
                .catch( (err) => res.status(501).json(err));


        
          })
          .catch((err) => {
            res.status(501).json(err);
          });

    });
  }
});





// PUT update dead-drop password



// DELETE dead-drop container

module.exports = app;

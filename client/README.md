```
     __            __       __                
 ___/ /__ ___ ____/ /______/ /______  ___    
/ _  / -_) _  / _  /___/ _  / __/ _ \/ _ \   
\_,_/\__/\_,_/\_,_/    \_,_/_/  \___/ .__/   
                                   /_/
```

> An anonymous file sharing & messaging system

# dead-drop (ui)


## Table of Contents

[1. Overview](#overview)

[2. Dependencies](#dependencies)

[3. Installation](#installation)

[4. Usage](#usage)

[5. Security](#security)

## Overview
Dead drop provides users with secure and anonymous file sharing. All messages and Binary Large Objects (BLOBS) are encrypted. There are no user accounts; instead, users create dead-drops using a hash & pass combo.

### Features
  - Compleately anonymous file sharing. No users. No email.
  - Dead Drops with unmodified passwords are deleted after a certian ammount of time
  - Encrypted file & messaging storage
  - Modify dead-drops anonymously

## Dependencies

Full Build:
- Express (RESTful API)
- Knex
- Docker
- Dotenv
- Crypto
- bcrypt
- Azure BLOB
- React
- pg

Development:
- Morgan (API request details)
- Nodemon
- Jest
- Testing-Library

## Dev Installation
For development purposes, you may clone the repo to your local computer. You will also need to clone the [dead-drop.api](https://github.com/TheMagicNacho/DeadDrop.api) repo. After cloning both repos run the following commands:
- `npm install` in both the UI and API
- `npm run dev` to start the API server
- `npm start` to start the React UI server
- Create PostgreSQL Docker container. Ensure the .env variables matches the DB name.
- Through Knex, run the latest migration `npx knex migrate:latest`
- Setup .env variables
    - CONNECTION_STRING: connects to PostgreSQL Docker container also running on local computer
        - Format: `postgres://USER_NAME:PASSWORD@localhost/DB_NAME`
    - AZURE_STORAGE_CONNECTION_STRING (Connects to Azure BLOB storage) [^1]
        - Format: `DefaultEndpointsProtocol=https;AccountName=STORAGEACCOUNTNAME;AccountKey=TOKEN_STRING`
    - AZURE_SAS_TOKEN: Azure token for accessing file downloads [^2]
        - Format: `?sv=TOKEN_STRING`
- 
- Go to http://localhost:3000 to access the UI server
- Go to http://localhost:8080 to access the API server

<br>
<br>

[^1]: ref: [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=environment-variable-windows#copy-your-credentials-from-the-azure-portal)

[^2]: ref: [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

## Usage
Live build is currently located at [https://dead-drop-ui.herokuapp.com/](https://dead-drop-ui.herokuapp.com/)

### Create a New Dead-Drop
1. Create a dead-drop. Either (m)essage or (f)ile
2. Remember your dead-drop's id and password. You cannot recover this later.
3. Share the dead-drop credentials with an associate.

### View a Dead-Drop
1. Enter the dead-drop's id & pass credentials
2. Press (s) and wait for the system to decrypt.
    - NOTE: Files will automatically begin downloading.

### Example message create and view:

![Messsage Create/View GIF](./message.gif)


### Example file create and view:

![File Create/View GIF](./file.gif)


### Option Tree
```

(m) Message
 |
 |__ (n) new message
 |   |_ (<string>) enter desired message
 |       |_ (<string>) enter desired password
 |           |_ (s) submit the credentials and receive dead-drop id hash
 |
 |__ (v) view dead-drop
 |   |_ (<string>) enter a dead-drop id hash
 |       |_ (<string>) enter the password associated with the dead-drop
 |           |_ (s) submit the credentials to decrypt the dead-drop
 |
 |__ (e) edit dead-drop
 |       |_ (<string>) enter a dead-drop id hash
 |           |_ (<string>) enter the password associated with the dead-drop
 |              |_ (<string>) enter messsage update
 |                  |_ (s) submit the credentials to commit changes
 |
 |__ (c) change password
 |   |_ enter a dead-drop id hash
 |       |_ (<string>) enter the password associated with the dead-drop
 |          |_ (<string>) enter the new password
 |              |_ (s) submit the credentials to commit changes
 |
 |__ (d) delete password
 |   |_ (<string>) enter a dead-drop id hash
 |       |_ (<string>) enter the password associated with the dead-drop
 |           |_ (s) submit the credentials to delete the dead-drop
 |
 (f) File
 |
 |__ (u) upload a new file
 |   |_ choose the desired file
 |       |_ (<string>) enter desired password
 |           |_ (s) submit the credentials and receive dead-drop id hash
 |
 |__ (v) view a file
 |   |_ (<string>) enter a dead-drop id hash
 |       |_ (<string>) enter the password associated with the dead-drop
 |           |_ (s) submit the credentials to download the file
 |
 |__ (d) delete a file (NOT SUPPORTED YET)
 |   |_ (<string>) enter a dead-drop id hash
 |       |_ (<string>) enter the password associated with the dead-drop
 |           |_ (s) submit the credentials to delete the file
 
(r) Return to the main menu

(clear) Clear the entire display 
 ```

## Security
 - No params. Everything is passed through headers so there is no plain text in the url.
 - Passwords are hashed and salted before storage
 - Dead drop objects are created from content hashes.
 - Messages are store with AES-256 Encryption
 - Keys feature 32 bit storage keys
 - We never use Cookies
# Dead Drop Server
Dead Drop is a secure and userless messeging platform.

The server uses a REST API to communicate with the client.
Encryption is achieved using post-quantom encryption algorithms and a hybrid Eclyptical Curve Diffie-Hellman (ECDH) and RSA encryption scheme.

# Languages
**Front End**: TypeScript

**Back End**: Rust

# Environment
We, the original developers, use UNIX like environments (MacOS || WSL || Linux).
The server and client are comipled and distributed using Docker containers.

## First Steps
1. Please install the following dependencies:
    - [Docker](https://docs.docker.com/get-docker/)
    - [make](https://www.gnu.org/software/make/)
    - [cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html)
    - [npm](https://www.npmjs.com/get-npm)
2. Set up the DEV environment:
    - `make setup-dev-env`
3. Setup the postgres container:
    - `make setup-dev-database`
4. Watch the server:
    - `make watch-server`
HOT TIP! you can run `make dev-up` to run all of the above commands at once.

# Design Tenets


- **Secure:** At it's core Dead Drop is designed with secuiryt in mind. The app uses Ecliptic Curve Cryptography and Post-Quantum Cryptography to encrypt data. All design decisions are made with security in mind.
- **Platform Agnostic:** Dead Drop uses a micro service archeticture, but is extremely lightweight. Only three interconnected containers are used. Meaning anyone can easily deploy their own DeadDrop instance.
- **Userless:** Dead Drop is designed to be a userless application. This means that there is no user management, and no user data is stored. This is to ensures that there is no way to track the sender or receiver of a message.


## 🐘 Database
DeadDrop uses postgresql as its database. We recommend bitnami's postgresql helm chart for easy deployment, but any postgresql instance will work.


### Development Connection
If the makefile does not work for you, you can manually set up the database using the following command:
`echo DATABASE_URL=postgres://postgres:postgres@localhost:5432/dead_drop > .env`


***Do not use these credentials in production.***


### Schema
DeadDrop uses a single table to store all messages and attachments. The table is called 'dead_drop' and has the following schema:


| Column Name | Data Type | Description | Nullable |
| ----------- | --------- | ----------- | -------- |
| id | VARCHAR(256) | The unique identifier for the message. A sha3 product. | False |
| title | VARCHAR(256) | The encrypted title. | True |
| msg | BYTEA | A binary searialization of the messege object. Encrypted. | True |
| att | BYTEA | A binaray serialization of binary large objects. Encrypted.| True |
| created_at | TIMESTAMP | The time the message was created. | False |
| modified_at | TIMESTAMP | The time the message was modified. Managed by server.| False |




> **Decision to use SQL**
>
> We decided to use SQL over other serverless options like fauna, because we wanted the DeadDrop container to be environment agnostic. Anybody can take this source code and deploy their own DeadDrop instance.




## 🏭 The Object Factory
The factory has objects which construct themselves.

All Dead Drop and Tickets objects have methods to encrypt and decrypt themselves.

***Ticket***:

The ticket object is a clear text object used to create the encrypted message.
- title: string
- message: string
- attachment: [u8]
- password: string
- action: string


***DeadDrop***

The DeadDrop object is an encrypted object used to store the message.
- id: uuid
- title: string (sha256)
- message: Payload
- attachment: Payload
- created_at: timestamp
- modified_at: timestamp


***Payload***

The Message object contains the encrypted message and a vector of public keys.
- message: [u8]
- public_keys: [u8]

## 🧑‍🔬 Future
- [ ] Drop subscription and notification
- [ ] Data distribution
- [ ] Mobile Application using React Native


# 💀 Dead Drop Developer Guide
> May your code be clean and your tests be green.

Dead Drop is a a userless encrypted message sharing platform. It is designed to be a secure, self-hosted, and easy to maintain.

Ye faithful champions of engineering, this guide is for you. Thou art destined to contribute thine code to the Dead Drop project.
Further tomes may be found here [docs](./docs).

## 🏪 The Front End
The web front end is a React Typescript application.

All front end instanciaes are reffered to as "clients".

We have plans to implement a mobile application using React Native, but we are still in the early stages of development.


## 🤖 Application Programming Interface
The DeadDrop API is a RESTful API which is designed to be easy to use and understand. The API is designed to be used by any client, but we have provided a web client for ease of use.

### Design Tenets

- **Secure:** At it's core Dead Drop is designed with secuiryt in mind. The app uses Ecliptic Curve Cryptography and Post-Quantum Cryptography to encrypt data. All design decisions are made with security in mind.
- **Platform Agnostic:** Dead Drop uses a micro service archeticture, but is extremely lightweight. Only three interconnected containers are used. Meaning anyone can easily deploy their own DeadDrop instance. 
- **Userless:** Dead Drop is designed to be a userless application. This means that there is no user management, and no user data is stored. This is to ensures that there is no way to track the sender or receiver of a message.


## 🐘 Database
DeadDrop uses postgresql as its database. We recommend bitnami's postgresql helm chart for easy deployment, but any postgresql instance will work.

### Development Connection
For use during development, we recommend using the following connection string:

`echo DATABASE_URL=postgres://postgres:postgres@localhost:5432/dead_drop > .env`

***Do not use these credentials in production.***

### Schema
DeadDrop uses a single table to store all messages and attachments. The table is called 'dead_drop' and has the following schema:




| Column Name | Data Type | Description | Nullable |
| ----------- | --------- | ----------- | -------- |
| id | VARCHAR(256) | The unique identifier for the message. A sha3 product. | False |
| title | VARCHAR(256) | The encrypted title. Title is synonymous to  | True |
| msg | BYTEA | A binary searialization of the messege object. Encrypted. | True |
| att | BYTEA | A binaray serialization of binary large objects. Encrypted.| True |
| created_at | TIMESTAMP | The time the message was created. | False |
| modified_at | TIMESTAMP | The time the message was modified. Managed by server.| False |


> **Decision to use SQL**
>
> We decided to use SQL over other serverless options like fauna, because we wanted the DeadDrop container to be environment agnostic. Anybody can take this source code and deploy their own DeadDrop instance.


## 🏭 The Object Factory
The factory has objects which construct themselves.

There are two public and one private object.

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

# 🛂 Contributing
## Want to help? We are always looking for new contributors!
- Fork the source repo.
- Visit the [GitHub project page](https://github.com/orgs/Artemis-Holdings/projects/3)
- OR look for issues on the [GitHub issues page](https://github.com/Artemis-Holdings/dead-drop/issues)
- Here we have features that need to be completed. Assign your self to any of the features in the "ready" column.
- Make a new branch using `git checkout -b <feature-name>`
- Commit your changes to the branch.
- Rebase and squash your changes into the master branch.
- Open a pull request.
- We'll review your pull request and if it's accepted, we'll merge your branch into the master branch.

## Have an issue?
- Search the [GitHub issues page](https://github.com/Artemis-Holdings/dead-drop/issues) to see if anyone has already reported the same problem you are having.
- If you have not found a solution, please create a new issue using the [bug template](https://github.com/TheMagicNacho/Silmarillion/issues/new?assignees=&labels=&template=bug_report.md&title=).
- If you have a new idea that has not been implemented yet, please create a new issue using the [feature template](https://github.com/TheMagicNacho/Silmarillion/issues/new?assignees=&labels=&template=feature_request.md&title=).

## Code of Conduct
We are a community of engineers, storytellers, and designers; we value everyone's participation and we strive to make our codebase a welcoming environment for all.
That's why we adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) to ensure a harassment-free experience in the community. 

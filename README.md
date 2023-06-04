# 💀 DeadDrop
Dead Drop is a a userless encrypted message sharing platform. It is designed to be a secure, self-hosted, and easy to maintain. 
Because the application is userless, it is not possible to track the sender or receiver of a message. The security is avhieved using Ecliptic Curve Cryptography and Post-Quantum Cryptography.

## 🤖 Application Programming Interface
The DeadDrop API is a RESTful API which is designed to be easy to use and understand. The API is designed to be used by any client, but we have provided a web client for ease of use.

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

Payload
The Message object contains the encrypted message and a vector of public keys.
- message: [u8]
- public_keys: [u8]



## 🐘 Database
DeadDrop uses postgresql as its database. We recommend bitnami's postgresql helm chart for easy deployment, but any postgresql instance will work.

### Schema
DeadDrop uses a single table to store all messages and attachments. The table is called 'dead_drop' and has the following schema:

| Column Name | Data Type | Description |
| ----------- | --------- | ----------- |
| id | UUID | The unique identifier for the message. |
| title | VARCHAR(256) | The title hash. |
| messege | BYTEA | A binary searialization of the messege object. Encrypted. |
| attachment | BYTEA | A binaray serialization of binary large objects. Encrypted.|
| created_at | TIMESTAMP | The time the message was created. |
| modified_at | TIMESTAMP | The time the message was modified. |


> ***Decision to use SQL***
>
> We decided to use SQL over other serverless options like fauna, because we wanted the DeadDrop container to be environment agnostic. Anybody can take this source code and deploy their own DeadDrop instance.


## The Object Factory




# Thoughts on Self-Documenting code.
We belive that code should be easy to read and 'self-document'. However, our lord and savior Brendan Eich graceiously gave us comments for a reason.

With that, our epistocological framework is as such: thou shalt write as if comments do not exist but still document when possible to help others understand your approach.

If you do not like our philosophy, fork this repo and write a bash script that strips out all the comments.



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
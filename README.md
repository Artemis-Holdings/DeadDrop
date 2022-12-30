# DeadDrop

Starting the server using `npm start` will start the server locally using dev environment variables. 
Please remember to build the container prior to production deployment. 

Decision to use SQL.
- We decided to use SQL over other serverless options like fauna, because we wanted the Dead Drop container to be environment agnostic. Anybody can take this source code and deploy their own DD instance and use any container.

- To further facilitate instance portability, DeadDrop has a custom written database adapter object. If you want to attach to an unsupported database, write your own adapter that has a 'write' & 'read' method within the adapter object.

# The Object Factory
There are two primary objects: The Request Ticket, and the Dead Drop
Both objects are extensions of the Cryptogropher.
FUTURE: An error boundry object which is returned to the client if there is an error on the server. Currently, an error on the server returns an empty dead drop; this prevents crashes but does not elaborate as to why something is wrong. 


## Request Ticket
A request ticket is an object instanciated by the user and used to create a dead drop. 
### From client
Dead Drop takes 1 POST request.
All methods to Create, Read, Update, or Delete are done through the 'action' key in the headder.
Header reqeust Must include:
```
title: string
password: string
payload: string
action: MESSAGE | TITLE | READ | WRITE | DELETE
```

### Server Side
The server validates that all 4 header items are present during request (index.ts);
The client's request is turned into a ticket object (index.ts) and passed to a controller (controller.ts).
The controller will use the provided action from the ticket to switch the ticket to the required service.


## Dead Drop
Created by the server and passed to the client.
# Controller > Service > Adapter > Repository
## Controller
The controller consists of two files: index.ts and controller.ts
index instanciates the server application (app.ts), listens to http requests, and instanciates a controller object.
The controller objects recieves the input and switches data accordingly.





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
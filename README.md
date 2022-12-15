# DeadDrop

Starting the server using `npm start` will start the server locally using dev environment variables. 
Please remember to build the container prior to production deployment. 

Decision to use SQL.
- We decided to use SQL over other serverless options like fauna, because we wanted the Dead Drop container to be environment agnostic. Anybody can take this source code and deploy their own DD instance and use any container.

# The Object Factory
There are two primary objects: The Request Ticket, and the Dead Drop
Both objects are extensions of the Cryptogropher. 


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
action: MSG | PSW | TITLE | READ | CREATE | DELETE
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

# DeadDrop

Starting the server using `npm start` will start the server locally using dev environment variables. 
Please remember to build the container prior to production deployment. 

Decision to use SQL.
- We decided to use SQL over other serverless options like fauna, because we wanted the Dead Drop container to be environment agnostic. Anybody can take this source code and deploy their own DD instance and use any container.
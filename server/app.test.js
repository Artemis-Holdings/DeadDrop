const { expect } = require("@jest/globals");
const { assert } = require("console");
const request = require("supertest");
const app = require("./app.js");
// const jest = require("@jest/globals")


// BASIC
describe('The root server', ()=>{ 
    test('should be online', (done) => {
        request(app)
            .get('')
            .expect(200)
            .expect((res) => {
                expect(res).toBeDefined();
            })
            .end((err, res) => {
                if(err) throw err;
                done();
        })
    });
});


// FILE
describe('File users should', ()=>{ 
    let idHash;

    beforeEach(function (done) {  
        done();
      });

    xtest('be able to create a dead drop.', (done) => {
        const userDetails = {
            "payload": "morpheus",
            "password": "password123"
        }; //new user details to be create
        request(app)
            .post('/file')
            .set(userDetails)
            .then((res) => {
                idHash = res["_body"]["msg_id"];
                expect(res.status).toBe(201)
                expect(idHash).not.toBeUndefined();
                done();
            })
    });

    xtest('be able to view a dead drop already created.', (done) => {
        const deadDropRequest = {
            "msg_id": idHash,
            "password": "password123"
        }; //new user details to be create
        request(app)
            .get('/file')
            .set(deadDropRequest)
            .then((res) => {
                expect(res.status).toBe(201)
                done();
            })
          
            // .exit();
    });

    xtest('be able to edit a previously created dead drop', (done) => {
        const deadDropRecall = {
            "msg_id": idHash,
            "password": "password123"
        };
        const deadDropRequest = {
            "msg_id": idHash,
            "password": "password123",
            "update": "trinity",
            "option": "msg"
        }; 

        request(app)
            .patch('/message')
            .set(deadDropRequest)
            .then((res) => {
                expect(res.status).toBe(201)
                request(app)
                    .get('/file')
                    .set(deadDropRecall)
                    .then((res) => {
                        expect(res.status).toBe(201);
                        // expect(res["_body"]["message"]).toBe("trinity");
                        done();
                    })

            })
    });

    xtest('be able to change the password to a dead drop.', (done) => {
        const deadDropRecall = {
            "msg_id": idHash,
            "password": "newPassword"
        };
        const deadDropRequest = {
            "msg_id": idHash,
            "password": "password123",
            "update": "newPassword",
            "option": "pas"
        }; 

        request(app)
            .patch('/file')
            .set(deadDropRequest)
            .then((res) => {
                expect(res.status).toBe(201)
                request(app)
                    .get('/file')
                    .set(deadDropRecall)
                    .then((res) => {
                        expect(res.status).toBe(201)
                        // expect(res["_body"]["message"]).toBe("trinity");
                        done();
                    })

            })
    });

    xtest('be able to delete a dead drop.', (done) => {
        const deadDropRequest = {
            "msg_id": idHash,
            "password": "newPassword"
        };


        request(app)
            .delete('/file')
            .set(deadDropRequest)
            .then((res) => {
                expect(res.status).toBe(201)
                // console.log(res["_body"])
                expect(res["_body"]["output"]).toBe("Dead Drop Destroyed")
                request(app)
                    .get('/file')
                    .set(deadDropRequest)
                    .then((res) => {
                        expect(res.status).toBeGreaterThan(400);
                        done();
                    })

            })
    });

});


// MESSAGE
describe('Message users should', ()=>{ 
    let idHash;

    beforeEach(function (done) {  
        done();
      });

    test('be able to create a dead drop.', (done) => {
        const userDetails = {
            "payload": "morpheus",
            "password": "password123"
        }; //new user details to be create
        request(app)
            .post('/message')
            .set(userDetails)
            .then((res) => {
                idHash = res["_body"]["msg_id"];
                expect(res.status).toBe(201)
                expect(idHash).not.toBeUndefined();
                done();
            })
    });

    test('be able to view a dead drop already created.', (done) => {
        const deadDropRequest = {
            "msg_id": idHash,
            "password": "password123"
        }; //new user details to be create
        request(app)
            .get('/message')
            .set(deadDropRequest)
            .then((res) => {
                expect(res.status).toBe(201)
                expect(res["_body"]["message"]).toBe("morpheus");
                done();
            })
          
            // .exit();
    });

    test('be able to edit a previously created dead drop', (done) => {
        const deadDropRecall = {
            "msg_id": idHash,
            "password": "password123"
        };
        const deadDropRequest = {
            "msg_id": idHash,
            "password": "password123",
            "update": "trinity",
            "option": "msg"
        }; 

        request(app)
            .patch('/message')
            .set(deadDropRequest)
            .then((res) => {
                expect(res.status).toBe(201)
                request(app)
                    .get('/message')
                    .set(deadDropRecall)
                    .then((res) => {
                        expect(res.status).toBe(201)
                        expect(res["_body"]["message"]).toBe("trinity");
                        done();
                    })

            })
    });

    test('be able to change the password to a dead drop.', (done) => {
        const deadDropRecall = {
            "msg_id": idHash,
            "password": "newPassword"
        };
        const deadDropRequest = {
            "msg_id": idHash,
            "password": "password123",
            "update": "newPassword",
            "option": "pas"
        }; 

        request(app)
            .patch('/message')
            .set(deadDropRequest)
            .then((res) => {
                expect(res.status).toBe(201)
                request(app)
                    .get('/message')
                    .set(deadDropRecall)
                    .then((res) => {
                        expect(res.status).toBe(201)
                        expect(res["_body"]["message"]).toBe("trinity");
                        done();
                    })

            })
    });


    test('be able to delete a dead drop.', (done) => {
        const deadDropRequest = {
            "msg_id": idHash,
            "password": "newPassword"
        };
        request(app)
            .delete('/message')
            .set(deadDropRequest)
            .then((res) => {
                expect(res.status).toBe(201)
                // console.log(res["_body"])
                expect(res["_body"]["output"]).toBe("Dead Drop Destroyed")
                request(app)
                    .get('/message')
                    .set(deadDropRequest)
                    .then((res) => {
                        expect(res.status).toBeGreaterThan(400);
                        done();
                    })

            })
    });

});
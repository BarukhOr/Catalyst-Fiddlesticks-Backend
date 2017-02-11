/**
 * Created by utibe on 2/9/17.
 */

const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const expect = chai.expect();

const config = require("../config/index.js");
const server = config.api_server;

const adminJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoxLCJtYXhCb29rIjoxLCJyb2xlIjo0MiwiaWF0IjoxNDg2ODI0MjMwLCJleHAiOjE0ODY4Njc0MzB9.lRkWFyXprBtRxD8gsfUcpr1dOhSisJjn2f-DE0qYTIc";
const coachJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoyLCJtYXhCb29rIjoxLCJyb2xlIjo4LCJpYXQiOjE0ODY4MjQxODksImV4cCI6MTQ4Njg2NzM4OX0.mOwi9Nz-631YNs9pYHM3LPXr137_ofHBsZPhqhRk-MI";
const studentJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjozLCJtYXhCb29rIjoxLCJyb2xlIjozMiwiaWF0IjoxNDg2ODIyODE5LCJleHAiOjE0ODY4NjYwMTl9.QiM3i1k_ZoQrkQsosDOkBTnQTjzC-qkdF3mZQjsAB30";

const coach_pass = "4b3b1311202c9fd8";
const student_pass = "8e395e4bd56bb2af";

chai.use(chaiHttp);

describe("Lesson", () => {
        /*it("should book a lesson", (done) => {
            chai.request(server)
                .post("/bookLesson")
                .set("Authorization", studentJWT)
                .send({"coach_id": 2, "time": "2017-02-06 17:03:00+00"})
                .end(function(error,response){
                    try{
                        response.should.have.status(200);
                        done();
                    } catch (error) {
                        done(error)
                    }
                    
                })
        })*/

        it("should cancel a lesson", (done) => {
            chai.request(server)
                .post("/cancelLesson")
                .set("Authorization", studentJWT)
                .send({"lesson_id": 2})
                .end(function(error,response){
                    try{
                        console.log(response.status)
                        // response.should.have.status(200);
                        done();
                    } catch (error) {
                        done(error)
                    }
                    
                })
        })
    })

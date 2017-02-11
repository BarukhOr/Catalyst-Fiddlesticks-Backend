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

describe("Authentication Tests", () => {

    describe("Setup Accounts", () => {
        it("should create an admin user", (done)=>{
            chai.request(server)
                .post("/signup")
                .send({"email":config.admin_email, 
                    "password":config.admin_default_password, 
                    "name": "Xaf Jr.", 
                    "summoner_name": "LuLuMein", 
                    "region": "NA"})
                .end(function(error, response){
                    try{
                        response.should.have.status(201);
                        done();
                    } catch(error) {
                        done(error)
                    }
                })
        })

        it("should create a coach", (done) => {
            chai.request(server)
                .post("/createCoach")
                .set("Authorization", adminJWT)
                .send({"email":config.coach_email, 
                    "name": "Coach Sr.", 
                    "summoner_name": "KayleMein", 
                    "region": "NA"})
                .end(function(error, response){
                    try{
                        response.should.have.status(201);
                        done()
                    } catch (error) {
                        done(error)
                    }
                })
        })

        it("should create a student", (done) => {
            chai.request(server)
                .post("/createStudent")
                .set("Authorization", adminJWT)
                .send({"email":config.student_email, 
                    "name": "Student Sr.", 
                    "summoner_name": "TeemoMein", 
                    "region": "NA"})
                .end(function(error, response){
                    try{
                        response.should.have.status(201);
                        done()
                    } catch (error) {
                        done(error)
                    }
                })
        })
    })

    describe("Login", () => {
        it("Admin login: should return a jwt and should also have isStudent: true, isCoach:true properties", (done) => {
            chai.request(server)
                .post("/auth")
                .send({"email":config.admin_email,
                    "password":config.admin_default_password})
                .end(function(error,response){
                    try{
                        console.log("Admin Token: ", response.body.token)
                        response.should.have.status(200);
                        response.body.should.have.property("student");
                        response.body.should.have.property("coach");
                        done();
                    } catch (error) {
                        done(error)
                    }
                    
                })
        })

        it("Coach login: should return a jwt and should also have isStudent: true, isCoach:true properties", (done) => {
            chai.request(server)
                .post("/auth")
                .send({"email":config.coach_email,
                    "password":coach_pass})
                .end(function(error,response){
                    try{
                        console.log("Coach Token: ", response.body.token)
                        response.should.have.status(200);
                        response.body.should.have.property("student");
                        response.body.should.have.property("coach");
                        done();
                    } catch (error) {
                        done(error)
                    }
                    
                })
        })

        it("Student login: should return a jwt and should also have isStudent: true, isCoach:true properties", (done) => {
            chai.request(server)
                .post("/auth")
                .send({"email":config.student_email,
                    "password":student_pass})
                .end(function(error,response){
                    try{
                        console.log("Student Token: ", response.body.token)
                        response.should.have.status(200);
                        response.body.should.have.property("student");
                        response.body.should.have.property("coach");
                        done();
                    } catch (error) {
                        done(error)
                    }
                    
                })
        })
    })
})


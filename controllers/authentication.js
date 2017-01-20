/**
 * Created by utibe on 1/13/17.
 */

const config = require("../config/index.js");
const db = require("../db_connect/index.js");
const fs = require("fs");
const bcrypt = require("bcrypt-as-promised");
const bluebird = require("bluebird");
const jwt = require("jsonwebtoken");
const preparedStatement = require("pg-promise").PreparedStatement;
const joi = require("joi");
const promise = require("promise");
const validate = bluebird.promisify(joi.validate);



/*
 * Makes it easy for other "modules" to check if someone has a specific role
 **/
const permissions ={
    "admin":2,
    "techTeam":4,
    "coach":8,
    "contentCreators":16,
    "student":32,
    "casual":64
};
exports.permissions = permissions;

const schema = joi.object().keys({
    email: joi.string().email(),
    password: joi.string().regex(/^.{8,30}$/),
    name: joi.string().regex(/^.{8,70}$/),
    ign: joi.string().regex(/^.{3,30}$/),
    region: joi.string().regex(/^.{2,30}$/)
});

module.exports = {
    signup: function (req, res){
        "use strict";
        validate({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            ign: req.body.ign,
            region: req.body.region
        }, schema)
            .then(function(data){   //Note creating the data variable here!!!
                const AuthFindUser=new preparedStatement("Auth find-account", "SELECT account_id FROM account WHERE email = $1 LIMIT 1");
                const AuthCreateUser=new preparedStatement("Auth create-student", "INSERT INTO account(email, upassword, name, ign, region, role) VALUES( $1, $2, $3, $4, $5, $6) RETURNING account_id");

                db.any(AuthFindUser, [data.email])
                    .then(function(account){
                        if (account.length === 0){

                            // Email is not used go ahead with registration
                            bcrypt.hash(data.password, 10)
                                .then(function(hash){
                                    data.password = hash;
                                    db.one( AuthCreateUser, [data.email, data.password, data.name, data.ign, data.region, permissions.admin] )
                                        .then(function(){
                                            return res.status(201).send({success: true,  message: 'created' });
                                        })
                                        .catch(function(error){
                                            // TODO: Log errors to a file
                                            // orm failed
                                            console.log("ERROR:", error.message || error);
                                            return res.status(500).send({success: false, message: 'Internal error. Please contact an admin' });
                                        })
                                })
                                .catch(function(error){
                                    // TODO: Log errors to a file
                                    // bcrypt failed
                                    console.log("ERROR:", error.message || error);
                                    return res.status(500).send({success: false, message: 'Internal error. Please contact an admin' });
                                });
                        }else{
                            return res.status(409).send({success:false, message: "That email already exists"});
                        }
                    })
                    .catch(function(error){
                        // TODO: Log errors to a file
                        // pg failed
                        console.log("ERROR:", error.message || error);
                        return res.status(500).send({ message: 'Internal error. Please contact an admin'});
                    })
            })
            .catch(function(err){
                if (err.details){
                    return res.status(400).send({ success:false, message: "Please check the "+err.details[0].path+" field", path: err.details[0].path});
                }
            })
    },

    signin: function (req, res, next) {
        "use strict";
        const AuthVerifyAccount=new preparedStatement("Auth verify-account", "SELECT account_id, max_weekly_sessions, upassword as password, role FROM account WHERE email = $1LIMIT 1");

        // Validate password & email
        validate({
            email: req.body.email,
            password: req.body.password
        }, schema)
            .then(function(data){
                db.any(AuthVerifyAccount, [data.email])
                    .then(function(account){
                        bcrypt.compare(data.password, account[0].password)
                            .then(function(){

                                // // TODO: Implement is Student/Coach Check
                                // // TODO: Append to req. account_type and add the flag student or coach (by default set it to student)

                                req.body = "";
                                req.account = account;
                                req.account_type = "student";
                                next();
                            })
                            .catch(function(error){
                                return res.status(400).send({success: false, message: "Incorrect Password or Email"});
                            })
                    })
                    .catch(function(error) {
                        console.log("Error", Error)
                        return res.status(500).send({success: false, message: "Internal error. Please contact an admin"})
                    })
            })
            .catch(function(err){
                if (err.details){
                    return res.status(400).send({ success:false, message: "Either the email or password that you used are incorrect"});
                }
            })
    },

    passwordEncrypt: function(token){
      return new Promise(function(fullfill, reject){
        bcrypt.hash(token, 10)
            .then(function(hash){
                fullfill(hash)
            })
            .catch(function(error){
                console.log("ERROR:", error.message || error);
                reject(error)
            });
      })
    },

    jwtLogin: function(request, response, next){
        "use strict";
        const token = request.headers.authorization || req.headers.Authorization;
        const mySecret = config.secret;
        if (token){
            const decoded= jwt.verify(token, config.secret, function(err, decoded) {
                if(err){
                    console.log("error: ", err)
                }else{
                    console.log("decoded", decoded)
                }
            });
            console.log("token (encoded): ", token)
            console.log("data (decoded): ",decoded);
            next();
        }else{
            return res.status(401).send({
                success: false,
                message: "Unauthorized"
            });
        }
    },

    tokenForUser: function(req, res){
        "use strict";
        const account = req.account[0];

        const token = jwt.sign({
            "accountid": account.account_id,
            "data": "foo",
            "test": 123,
            "maxBook": account.max_weekly_sessions,
            "role": account.role
        }, config.secret, { expiresIn: '1h' });

        return res.status(200).send({ success: true, token: token, type: req.account_type})
    }
}

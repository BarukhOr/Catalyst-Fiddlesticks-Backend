/**
* Created by utibe on 1/13/17.
*/

const config = require("../config/index.js");
const db = require("../db_connect/index.js");
const statusCode = require("./statusCode.js");

const bcrypt = require("bcrypt-as-promised");
const bluebird = require("bluebird");
const jwt = require("jsonwebtoken");
const preparedStatement = require("pg-promise").PreparedStatement;
const joi = require("joi");
const validate = bluebird.promisify(joi.validate);
const Promise = require("promise");

/*
* Makes it easy for other "modules" to check if someone has a specific role
**/
const permissions = {
    "admin": 2,
    "techTeam": 4,
    "coach": 8,
    "contentCreators": 16,
    "student": 32,
    "casual": 64
};

const schema = joi.object().keys({
    email: joi.string().email(),
    password: joi.string().regex(/^.{8,30}$/),
    name: joi.string().regex(/^.{3,70}$/),
    ign: joi.string().regex(/^.{3,30}$/),
    region: joi.string().regex(/^.{2,30}$/)
});

function isAdmin(role) {
    "use strict";
    if (role && permissions.admin) {
        return true;
    } else {
        return false;
    }
}

function isCoach(role) {
    "use strict";
    if (role && permissions.coach) {
        return true;
    } else {
        return false;
    }
}

function isStudent(role) {
    "use strict";
    if (role && permissions.student) {
        return true;
    } else {
        return false;
    }
}

module.exports = {

    isAdmin: isAdmin,

    isCoach: isCoach,

    isStudent: isStudent,

    permissions: permissions,

    schema: schema,

    //Creates admin !!!This route is only for dev purposes!!!
    signup: function (request, response) {
        "use strict";

        validate({
            email: request.body.email,
            password: request.body.password,
            name: request.body.name,
            ign: request.body.ign,
            region: request.body.region
        }, schema)
            .then(function (data) {
                const findUser = new preparedStatement("Find-User", "SELECT account_id FROM account WHERE email = $1 LIMIT 1");
                const createAdmin = new preparedStatement("Create-Admin", "INSERT INTO account(email, upassword, name, ign, region, role) VALUES( $1, $2, $3, $4, $5, $6) RETURNING account_id");

                db.any(findUser, [data.email])
                    .then(function (account) {
                        if (account.length === 0) {
                        // Email is not used go ahead with registration
                            bcrypt.hash(data.password, 10)
                                .then(function (hash) {
                                    data.password = hash;
                                    db.one(createAdmin, [data.email, data.password, data.name, data.ign, data.region, permissions.admin])
                                        .then(function () {
                                            // return response.status(201).send({success: true,  message: 'created' });
                                            statusCode.created(response);
                                        })
                                        .catch(function (error) {
                                            statusCode.internalServerError(error, response);
                                        });
                                })
                                .catch(function (error) {
                                    statusCode.internalServerError(error, response);
                                });
                        } else {
                            statusCode.conflict(response);
                        }
                    })
                    .catch(function (error) {
                        statusCode.internalServerError(error, response);
                    });
            })
            .catch(function () {
                // TODO: make this error message more informative
                // This error should tell user what information they are missing
                statusCode.badRequest(response);
            });
    },

    signin: function (request, response, next) {
        "use strict";
        const verifyAccount = new preparedStatement("Verify-Account", "SELECT account_id, max_weekly_sessions, upassword as password, role FROM account WHERE email = $1LIMIT 1");

        // Validate password & email
        validate({
            email: request.body.email,
            password: request.body.password
        })
            .then(function (data) {
                db.any(verifyAccount, [data.email])
                    .then(function (account) {
                        bcrypt.compare(data.password, account[0].password)
                            .then(function () {
                                request.body = "";
                                request.account = account;
                                // TODO: Implement this method which determines whether student is a student or a coach and sends that in response
                                request.student = isStudent(account.role);
                                request.coach = isCoach(account.role);
                                next();
                            })
                            .catch(function () {
                                return response.status(400).send({success: false, message: "Incorrect Password or Email"});
                            });
                    })
                    .catch(function (error) {
                        statusCode.internalServerError(error, response);
                    });
            })
            .catch(function () {
                // console.log("error", error.message);
                // TODO: make this error message more informative
                statusCode.badRequest(response);
            });
    },

    passwordEncrypt: function (token) {
        "use strict";
        return new Promise(function (fullfill, reject) {
            bcrypt.hash(token, 10)
                .then(function (hash) {
                    fullfill(hash);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    },

    jwtLogin: function (request, response, next) {
        "use strict";
        const token = request.headers.authorization || request.headers.Authorization;

        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return response.status(401).send("Token has expired and is no longer valid.");
                } else {
                    request.user = decoded;
                    next();
                }
            });
        } else {
            statusCode.unauthorized(response);
        }
    },

    tokenForUser: function (request, response) {
        "use strict";
        const account = request.account[0];
        const token = jwt.sign({
            "accountid": account.account_id,
            "data": "foo",
            "test": 123,
            "maxBook": account.max_weekly_sessions,
            "role": account.role
        }, config.secret, {expiresIn: "12h"});

        return response.status(200).send({success: true, token: token, student: request.student, coach: request.coach});
    },

    resetPassword: function (request, response) {
        // TODO: allow users to reset their email
        statusCode.notImplemented(response);
    }
};

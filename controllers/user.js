const db = require("../db_connect/index.js");
const auth = require("./authentication.js");
const statusCode = require("./statusCode.js");

const Promise = require("promise");
const nodemailer = require("nodemailer");
const markdown = require("nodemailer-markdown").markdown;
const transporter = nodemailer.createTransport();
const preparedStatement = require("pg-promise").PreparedStatement;

transporter.use("compile", markdown());

function localCreateUser(data) {
    "use strict";
    return new Promise(function (fullfill, reject) {
        const token = require("crypto").randomBytes(8).toString("hex");
        auth.passwordEncrypt(token)
            .then(function (hashPassword) {
                const createUser = new preparedStatement("Create-User", "INSERT INTO account(email, upassword, name, ign, region, role) VALUES( $1, $2, $3, $4, $5, $6) RETURNING account_id");
                db.one(createUser, [data.email, hashPassword, data.name, data.summoner_name, data.region, data.role])
                    .then(function (result) {
                        /**
                         * TODO: huge possible error here
                         * mailToken is "out of scope" not sure how to address that at the moment
                         */
                        mailToken(token, data.email)
                            .then(function () {
                                fullfill(result);
                            })
                            .catch(function (error) {
                                reject(error);
                            });
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

function mailToken(token, mailTo) {
    "use strict";
    let message = "Catalyst Coaching \n\n" +
            "#### Welcome to Catalyst Coaching \n\n" +
            "[![Catalyst Coaching](https://cldup.com/dTxpPi9lDf.thumb.png)](https://shroorima.com) \n\n" +
            "Your application to Catalyst Coaching has been approved. \n\n" +
            "Please log into the [Catalyst Portal] with the password" + token + " \n\n" +
            "[Catalyst Portal]: <https://shroorrima.com/>";

    return new Promise(function (fullfill, reject) {
        try {
            transporter.sendMail({
                from: "no-reply@catalyst.com",
                to: mailTo,
                markdown: message
            });
            fullfill(true);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    createStudent: function (request, response) {
        "use strict";
        if (auth.isAdmin(request.user.role)) {
            request.body.role = auth.permissions.student;
            localCreateUser(request.body)
                .then(function (data) {
                    console.log(data);
                    // TODO: Create student entry in student table
                    // const createStudent = new preparedStatement("Create-Student", "INSERT INTO student(account_id) VALUES($1) RETURNING student_id");
                    // db.one(createStudent, [data.account_id])
                    //     .then()
                    //     .catch();
                    statusCode.ok(response);
                })
                .catch(function (error) {
                    console.log("Error: ", error.message, error);
                    statusCode.internalServerError(response);
                });
        } else {
            statusCode.unauthorized(response);
        }
    },

    createCoach: function (request, response) {
        "use strict";
        if (auth.isAdmin(request.user.role)) {
            request.body.role = auth.permissions.coach;
            localCreateUser(request.body)
                .then(function (data) {
                    console.log(data);
                    // TODO: Create a coach entry in the corresponding table
                    // const createCoach = new preparedStatement("Create-Coach", "INSERT INTO coach(account_id) VALUES($1) RETURNING coach_id");
                    // db.one(createCoach, [data.account_id])
                    //     .then()
                    //     .catch();
                    statusCode.ok(response);
                })
                .catch(function (error) {
                    console.log("Error: ", error.message, error);
                    statusCode.internalServerError(response);
                });
        } else {
            statusCode.unauthorized(response);
        }
    },

    editUserRole: function (request, response) {
        "use strict";
        statusCode.notImplemented(response);
        /**
         * Given a user id
         * if the user corresponding to that user id is not an admin
         * Allow this admin to modify their role
         */
    }
};
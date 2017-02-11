const moment = require("moment");
const pg = require("pg-promise");
const preparedStatement = pg.PreparedStatement;

const db = require("../db_connect/index.js");
const auth = require("./authentication.js");
const statusCode = require("./statusCode.js");

function availInputParse(times) {
    "use strict";
    const result = [];
    times.forEach(function (entry) {
        const utc_entry = moment(entry).utc().format();
        let row = {utc: utc_entry};
        result.push(row);
    });
    return result;
}

module.exports = {
    createAvailabilities: function (request, response) {
        "use strict";
        const availTime = request.body.available;

        if (auth.isCoach(request.user.role)) {
            if (availTime.length > 0) {
                const user_id = request.user.account_id;
                const data = availInputParse(availTime);
                const findExistingAvail = new preparedStatement("Find Existing Availability", "select * from availability where coach_id = $1 and available_time = $2");
                const createAvail = new preparedStatement("Create Availability", "INSERT INTO availability(coach_id, available_time) VALUES($1, $2)");
                data.forEach(function (time) {
                    db.any(findExistingAvail, [user_id, time.utc])
                        .then(function (result) {
                            if (result.length === 0) {
                                db.none(createAvail, [user_id, time.utc])
                                    .catch(function (error) {
                                        statusCode.internalServerError(error, response);
                                    });
                            }
                        })
                        .catch(function (error) {
                            statusCode.internalServerError(error, response);
                        });
                });
                statusCode.created(response);
            } else {
                statusCode.badRequest(response);
            }
        } else {
            statusCode.unauthorized(response);
        }

    },
    deleteAvailability: function (request, response) {
        "use strict";
        // Get input
        const availTime = request.body.available;
        const user_id = request.user.account_id;

        if (auth.isCoach(request.user.role)) {
            
            const data = availInputParse(availTime); // Converts the user's times to utc
            if (availTime.length > 0) {
                data.forEach(function(time){
                    db.any("SELECT * FROM availability WHERE coach_id = $1 and available_time = $2", [user_id, time.utc])
                        .then(function(data){
                            const avail_result = data[0];
                            if (avail_result){
                                if(avail_result.booked === false){
                                    // delete availability
                                    db.none("DELETE FROM availability where avail_id = $1", [avail_result.avail_id])
                                        .then(function(){
                                            statusCode.ok(response);                                            
                                        })
                                        .catch(function(error){
                                            statusCode.internalServerError(error, response);
                                        })
                                } else {
                                    db.any("SELECT * FROM lesson WHERE coach_id = $1 AND lesson_time = $2", [user_id, time.utc])
                                        .then(function(lesson_result){
                                            if(lesson_result[0].completed === false){

                                                // TODO: Notify Student
                                                // cancelBookingNotify(coach_id, student_id, lesson_time) if lesson has not been completed
                                                db.none("DELETE FROM lesson where lesson_id = $1", [lesson_result[0].lesson_id])
                                                    .then(function(){
                                                       db.none("DELETE FROM availability where avail_id = $1", [avail_result.avail_id])
                                                           .then(function(){
                                                               statusCode.ok(response);                                            
                                                           })
                                                           .catch(function(error){
                                                               statusCode.internalServerError(error, response);
                                                           }) 
                                                    })
                                                    .catch(function(error){
                                                        statusCode.internalServerError(error, response);
                                                    })
                                            }else {
                                                statusCode.customBadRequest(response, "The lesson was already completed");
                                            }
                                           
                                        })
                                        .catch(function(error){
                                            statusCode.internalServerError(error, response);
                                        })
                                }
                            } else {
                                statusCode.customBadRequest(response, "The availability does not exist");
                            }
                            
                        })
                        .catch(function(error){
                            statusCode.internalServerError(error, response);
                        })
                });
            } else {
                statusCode.badRequest(response);
            }
        } else {
            statusCode.unauthorized(response);
        }
    },
    getMyAvailability: function (request, response){
        "use strict";
        if (auth.isCoach(request.user.role)) {
            const sunday = moment().day(0).format("YYYY-MM-DD");
            const nextSunday = moment().day(7).format("YYYY-MM-DD");
            console.log(sunday, nextSunday)
            const getAvailable = new preparedStatement("Get Available", "SELECT * FROM availability WHERE available_time >= $1 AND available_time < $2 and coach_id = $3");

            db.any(getAvailable, [sunday, nextSunday])
                .then(function (result) {
                    statusCode.successfulGet(response, result);
                })
                .catch(function (error) {
                    statusCode.internalServerError(error, response);
                });
        } else {
            statusCode.unauthorized(response);
        }
    },
    getAvailability: function (request, response) {
        "use strict";
        // TODO: check to see if user is not casual
        const sunday = moment().day(0).format("YYYY-MM-DD");
        const nextSunday = moment().day(7).format("YYYY-MM-DD");
        const getAvailable = new preparedStatement("Get Available", "SELECT * FROM availability WHERE available_time >= $1 AND available_time < $2");

        db.any(getAvailable, [sunday, nextSunday])
            .then(function (result) {
                statusCode.successfulGet(result, response);
            })
            .catch(function (error) {
                statusCode.internalServerError(error, response);
            });
    }
};

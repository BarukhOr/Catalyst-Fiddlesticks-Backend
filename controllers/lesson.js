const moment = require("moment");
const pg = require("pg-promise");
const preparedStatement = pg.PreparedStatement;

const db = require("../db_connect/index.js");
const auth = require("./authentication.js");
const statusCode = require("./statusCode.js");

module.exports = {
    bookLesson: function (request, response) {
        "use strict";
        let mayBookTime = "";

        // TODO: Check to see if the availability is valid
        if (request.body.time){
            mayBookTime = moment(request.body.time).utc().format();
        } else {
            return statusCode.badRequest(response);
        }

        const lastSaturday = moment().day(-1).format("YYYY-MM-DD");
        const nextSunday = moment().day(7).format("YYYY-MM-DD");

        if (auth.isStudent(request.user.role)) {
            if (moment(mayBookTime).isAfter(lastSaturday) && moment(mayBookTime).isBefore(nextSunday)) {
                db.task(function (t) {
                    return t.batch([
                        t.any("select * from availability where coach_id = $1 and available_time = $2", [request.body.coach_id, mayBookTime]),
                        t.any("select count(*) from lesson where student_id = $1 and lesson_time > $2 and lesson_time <$3", [request.user.account_id, lastSaturday, nextSunday])
                    ]);
                })
                    .then(function(data){
                        const avail = data[0][0];
                        const bookingCount = data[1][0];
                        
                        if (!avail){ // Invalid coach or time slot
                            statusCode.badRequest(response);
                        } 
                        else if (avail.booked === false && bookingCount.count < request.user.maxBook){ // Note the result of each individual query is nested within several arrays.
                            console.log(request.user)
                            db.none("UPDATE availability SET booked = true where avail_id = $1", avail.avail_id)
                                .then(function(){
                                    db.none("INSERT INTO lesson(coach_id, student_id, lesson_time) VALUES($1, $2, $3)", [avail.coach_id, request.user.account_id, avail.available_time])
                                        .then(function(){
                                            statusCode.created(response);
                                        })
                                        .catch(function(error){
                                            statusCode.internalServerError(error, response);
                                        });
                                })
                                .catch(function(error){
                                    statusCode.internalServerError(error, response);
                                });
                        }
                        else if (bookingCount.count >= request.user.maxBook){
                            statusCode.customBadRequest(response, "Sorry you can not book any more lessons for this week");
                        }
                        else {
                            statusCode.customBadRequest(response, "Sorry the lesson is already booked");
                        }

                        
                    })
                    .catch(function(error){
                        statusCode.internalServerError(error, response);
                    });

                // statusCode.ok(response);
            } else {
                // Error saying invalid timeslot
                statusCode.badRequest(response);
            }
        }else{
            statusCode.unauthorized(response);
        }

    },
    myWeeksLessons: function (request, response) {
        "use strict";
        if (auth.isStudent(request.user.role) || auth.isCoach(request.user.role)){
            const sunday = moment().day(0).format("YYYY-MM-DD");
            const nextSunday = moment().day(7).format("YYYY-MM-DD");
            // TODO: Confirm safety of this query
            db.any("SELECT * from lesson WHERE lesson_time >= $1 AND lesson_time < $2 AND (student_id = $3 OR coach_id = $3)", [sunday, nextSunday, request.user.account_id])
                .then(function(result){
                    statusCode.successfulGet(response, result)
                })
                .catch(function(error){
                    statusCode.internalServerError(error, response)
                })
        }else {
            statusCode.unauthorized(response);
        }
    },
    cancelLesson: function (request, response) {
        "use strict";
        const data = request.body;
        if (auth.isStudent(request.user.role)) {
            console.log(request.body)
            db.any("SELECT * FROM lesson WHERE lesson_id = $1", [data.lesson_id])
                .then(function(result){
                    if(result[0].completed === false){
                        // Set associated availability "booked status" equal to false
                        db.task(function (t) {
                            return t.batch([
                                t.any("UPDATE availability SET booked = false WHERE coach_id = $1 AND available_time = $2", [result[0].coach_id, result[0].lesson_time]),
                                t.any("DELETE FROM availability WHERE lesson_id = $1", [data.lesson_id])
                            ]);
                        })
                            .then(function(){
                                statusCode.ok(response)
                            })
                            .catch(function(error){
                                statusCode.internalServerError(error, response);
                            })
                    } else {
                        statusCode.customBadRequest(response, "Lesson has already been completed");
                    }
                    console.log(result)
                    statusCode.ok(response);
                })
                .catch(function(error){
                    statusCode.internalServerError(error, response);
                })            
        } else {
            statusCode.unauthorized(response);
        }
    },
    completeLesson: function (request, response) {
        "use strict";
        if (auth.isCoach(request.user.role)){
            db.any("UPDATE lesson SET completed = true where coach_id = $1 and lesson_id = $2", [request.user.account_id, request.body.lesson_id])
                .then(function(){
                    // TODO: does this need better response?
                    statusCode.ok(response);
                })
                .catch(function(error){
                    statusCode.internalServerError(error, response);
                })
        }else {
            statusCode.unauthorized(response);
        }
    }
};

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
                const user_id = request.user.accountid;
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
                statusCode.ok(response);
            } else {
                statusCode.badRequest(response);
            }
        } else {
            statusCode.unauthorized(response);
        }

    },
    deleteAvailability: function (request, response) {
        "use strict";
        const availTime = request.body.available;
        const user_id = request.user.accountid;
        if (auth.isCoach(request.user.role)) {
            const data = availInputParse(availTime);
            if (availTime.length > 0) {
                const deleteAvail = new preparedStatement("Delete Availability", "DELETE FROM availability WHERE coach_id = $1 and available_time = $2");
                data.forEach(function(time){
                    db.any(deleteAvail, [user_id, time.utc])
                        .then()
                        .catch(function(error){
                            statusCode.internalServerError(error, response);
                        });
                });
                statusCode.ok(response);
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
            const saturday = moment().day(7).format("YYYY-MM-DD");
            const getAvailable = new preparedStatement("Get Available", "SELECT * FROM availability WHERE available_time >= $1 AND available_time < $2 and coach_id = $3");

            db.any(getAvailable, [sunday, saturday])
                .then(function (result) {
                    statusCode.successfulGet(result, response);
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
        const saturday = moment().day(7).format("YYYY-MM-DD");
        const getAvailable = new preparedStatement("Get Available", "SELECT * FROM availability WHERE available_time >= $1 AND available_time < $2");

        db.any(getAvailable, [sunday, saturday, request.user.accountid])
            .then(function (result) {
                statusCode.successfulGet(result, response);
            })
            .catch(function (error) {
                statusCode.internalServerError(error, response);
            });
    }
};

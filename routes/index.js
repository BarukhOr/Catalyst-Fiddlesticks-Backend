/**
 * Created by utibe on 1/13/17.
 */
const auth = require("../controllers/authentication.js");
const user = require("../controllers/user.js");
const avail = require("../controllers/availability.js");

module.exports = function (app) {
    "use strict";

    app.get("/", function (request, response) {
        const message = request._remoteAddress + " You have come across a well placed shroom";
        return response.status(200).json({message: message});
    });

    // A signup route that is used to create admins
    app.post("/signup", auth.signup);

    // // Signin route
    app.post("/auth", auth.signin, auth.tokenForUser);

    // // A test route that requires authentication
    app.get("/protected", auth.jwtLogin, function (request, response) {
        return response.status(200).json({message: "yes you are logged in~"});
    });

    // TODO: Implement a route for devs to create students
    app.post("/createStudent", auth.jwtLogin, user.createStudent);

    // TODO: Implement a route for devs to create coaches
    app.post("/createCoach", auth.jwtLogin, user.createCoach);

    // TODO: Implement get this weeks lessons
    app.get("/getAvailable", auth.jwtLogin, avail.getAvailability);

    // TODO: Implement create availabilities
    app.post("/createAvailabile", auth.jwtLogin, avail.createAvailabilities);

    // TODO: Implement delete availabilities
    app.post("/deleteAvailable", auth.jwtLogin, avail.deleteAvailability);

    // TODO: Implement create multiple availabilities

    // TODO: Implement create lesson (book a session)

};

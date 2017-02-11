/**
 * Created by utibe on 1/13/17.
 */
const auth = require("../controllers/authentication.js");
const user = require("../controllers/user.js");
const avail = require("../controllers/availability.js");
const lesson = require("../controllers/lesson.js");

module.exports = function (app) {
    "use strict";

    app.get("/", function (request, response) {
        const message = request._remoteAddress + " You have come across a well placed shroom";
        return response.status(418).json({message: "Short And Stout"});
    });

    // A signup route that is used to create admins
    app.post("/signup", auth.signup);

    // A test route that requires authentication
    app.get("/protected", auth.jwtLogin, function (request, response) {
        return response.status(200).json({message: "yes you are logged in~"});
    });
    
    // Signin route
    app.post("/auth", auth.signin, auth.tokenForUser);

    app.post("/createStudent", auth.jwtLogin, user.createStudent);

    app.post("/createCoach", auth.jwtLogin, user.createCoach);

    app.get("/getAvailable", auth.jwtLogin, avail.getAvailability);

    app.post("/createAvailabile", auth.jwtLogin, avail.createAvailabilities);

    app.post("/deleteAvailable", auth.jwtLogin, avail.deleteAvailability);

    app.post("/bookLesson", auth.jwtLogin, lesson.bookLesson);

    app.post("/cancelLesson", auth.jwtLogin, lesson.cancelLesson);

    // TODO: Test these routes
    app.get("/myLessons", auth.jwtLogin, lesson.myWeeksLessons);

    app.post("/completeLesson", auth.jwtLogin, lesson.completeLesson);

};

/**
 * Created by utibe on 1/13/17.
 */
const auth = require("../controllers/authentication.js");
const user = require("../controllers/user.js");

module.exports = function (app) {
    "use strict";

    app.get("/", function (request, response) {
        const message = request._remoteAddress + " You have come across a well placed shroom";
        return response.status(200).json({message: message});
    });

    // A signup route that is used to create admins
    app.post("/signup", auth.signup);

    // // Signin route
    // app.post("/auth", auth.signin, auth.tokenForUser);

    // // A test route that requires authentication
    app.get("/protected", auth.jwtLogin, function (request, response) {
        return response.status(200).json({message: "yes you are logged in~"});
    })

    // TODO: Implement a route for devs to create students
    // app.post("/maker", auth.jwtLogin, user.createStudent )

    // TODO: Implement a route for devs to create coaches

    // TODO: Implment a route for devs to create users (neither student/coach)

    // TODO: Implement get all availabilities

    // TODO: Implement get this weeks lessons

    // TODO: Implement create availabilities

    // TODO: Implmenet create multiple availabilities

    // TODO: Implement create lesson (book a session)


};

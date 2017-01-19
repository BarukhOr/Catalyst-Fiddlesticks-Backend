/**
 * Created by utibe on 1/13/17.
 */
const Auth = require("../controllers/authentication.js");

module.exports = function (app) {
    "use strict";

    app.get("/", function (req, res) {
        const message = req._remoteAddress + " You have come across a well placed shroom";
        return res.status(200).json({message: message});
    });

    // A signup route that is used to create admins
    app.post("/signup",Auth.signup);
 
    // Signin route
    app.post("/auth", Auth.signin, Auth.tokenForUser);

    // A test route that requires authentication
    app.get("/protected", Auth.jwtLogin,function(req, res){
        return res.status(200).json({message: "yes you are logged in~"});
    })

    // TODO: Implement a route for devs to create students

    // TODO: Implement a route for devs to create coaches

    // TODO: Implement get all availabilities

    // TODO: Implement get this weeks lessons

    // TODO: Implement create availabilities

    // TODO: Implmenet create multiple availabilities

    // TODO: Implement create lesson (book a session)


};

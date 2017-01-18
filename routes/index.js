/**
 * Created by utibe on 1/13/17.
 */

module.exports = function (app) {
    "use strict";
    app.get("/", function (req, res) {
        const message = req._remoteAddress + " You have come across a well placed shroom";
        console.log(req)
        res.status(200).json({message: message});
    });

    // TODO: Implement a test route that requires authentication

    // TODO: Implement get all availabilities

    // TODO: Implement get this weeks lessons

    // TODO: Implement create availabilities

    // TODO: Implmenet create multiple availabilities

    // TODO: Implement create lesson (book a session)


};

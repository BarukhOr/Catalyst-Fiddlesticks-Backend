module.exports = {
    ok: function (response) {
        "use strict";
        return response.status(200).send({success: true, message: "success"});
    },

    successfulGet: function (result, response) {
        "use strict";
        return response.status(200).send({success: true, message: "success", result: result});
    },

    created: function (response) {
        "use strict";
        return response.status(201).send({success: true, message: "success"});
    },

    accepted: function (response) {
        "use strict";
        return response.status(202).send({success: true, message: "success"});
    },

    badRequest: function (response) {
        "use strict";
        return response.status(400).send({
            success: false,
            message: "Please ensure you filled out all the requested fields with valid inputs"
        });
    },

    unauthorized: function (response) {
        "use strict";
        return response.status(401).send({success: false, message: "unauthorized"});
    },

    conflict: function (response) {
        "use strict";
        return response.status(409).send({
            success: false,
            message: "You are trying to create an object that already exists"
        });
    },

    teapot: function (response) {
        "use strict";
        return response.status(418).send({
            success: false,
            message: "short and stout"
        });
    },

    internalServerError: function (error, response) {
        "use strict";
        console.log("ERROR:", error.message || error);
        return response.status(500).send({success: false, message: "Internal error. Please contact an admin"});
    },

    notImplemented: function (response) {
        "use strict";
        return response.status(501).send({success: false, message: "This route has yet to be implemented"});
    }
};

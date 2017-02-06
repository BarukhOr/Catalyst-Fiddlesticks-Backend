const db = require("../db_connect/index.js");
const auth = require("./authentication.js");
const statusCode = require("./statusCode.js");

const preparedStatement = require("pg-promise").PreparedStatement;

module.exports = {
    myWeeksLessons: function () {
        "use strict";
        const weeksLessons = new preparedStatement("Weeks's Lessons", "s");
        // TODO: Get all sessions from this week that have either my id in the student/coach field
    },
    bookALesson: function () {
        "use strict";
        // TODO: Check to see if the availability booked already?
        // TODO: Can student book more availabilities
        // TODO: Mark Availability as booked
        // TODO: Create booking
    },
    cancelALesson: function () {
        "use strict";
        // TODO: If i have this lesson booked
        // and completed is set to false, cancel it.
    },
    completeSession: function () {
        "use strict";
        // TODO: Mark Lesson as complete
        // If coach has notes, add them to the coach_notes
    }
};

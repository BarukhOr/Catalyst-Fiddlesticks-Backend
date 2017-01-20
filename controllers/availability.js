module.exports = {
  createAvailabilities: function(){
    // TODO: Accept a dynamic number of timeslots and insert them into the availability table
      // TODO: Need to check the table to see if the timeslot w/ the specific coach already exists.
        // If it does, then skip it?
        // Else add the availability
  },
  updateAvailability: function(){
    // Not sure this is needed atm
  },
  deleteAvailability: function(){
    // TODO: Before Availability is deleted, check to see if there is an associated Lesson
    // TODO: If there is, notify the coach, and have him confirm the decision to delete the session
      // Send student a notification, that the session has been cancelled.
      // Give coach the option of leaving a message
  }
}

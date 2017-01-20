const auth = require("./authentication.js");
const promise = require("promise");

module.exports = {
  createStudent: function(request, response){
    // TODO: Create account for user
    const email = "123@gmail.com"
    module.exports.createUser(email)
          .then(function(value){
            console.log(value)
            return response.status(200).send({message: "it worked"})
          })
          .then(function(){
            // TODO: Create a student table
          })

  },

  createCoach: function(){
    // TODO: Create account for user
    // TODO: Create a coach table
  },

  createUser: function(email){
    return new Promise(function(fullfill, reject){

      const token = require('crypto').randomBytes(8).toString('hex');
      auth.passwordEncrypt(token)
          .then(function(hashPassword){
            console.log("Hash printout", hashPassword);
            // TODO: Create Account with this password
            fullfill("ok")
          })
          .catch(function(error){
            // No token was provided
            console.log("ERROR:", error.message || error);
            return res.status(500).send({success: false, message: 'Internal error. Please contact an admin' });
          })
    })

    // TODO: Ensure that requestor is an admin
    // TODO: Used to create bare minimum table entry for a user
    // TODO: Create token (for password) and email that token to user
  }
}

const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user.model");
const bcrypt = require("bcrypt");


function init(passport) {                       
  passport.use(
    new LocalStrategy(                        
      {
        usernameField: "email",                
      },

      async (email, password, done) => {           
        // login
        // check if email exist...
        const user = await User.findOne({ email: email });

        if (!user) {
          return done(null, false, { message: "No user with this email" });            
        }
      
        bcrypt
          .compare(password, user.password)
          .then((match) => {                     
            if (match) {
              return done(null, user, { message: "logged in successfully" }); 
            }

            return done(null, false, { message: "Wrong username or password" }); 
          })
          .catch((err) => {                      
            return done(null, false, { message: "Something went wrong" }); // password comparing issue..
          });
      }
    )
  );

  passport.serializeUser((user, done) => {        
    done(null, user._id);                    
  });

  passport.deserializeUser(async(id, done) => {               
    try {
      const user = await User.findById(id);
      if(user){
        done(null, user);           // err is null and user object is returned....
      }
      else {
        done(null, null);            // No user found
      }
    }
    catch(err) {
      done(err, null);
    };
  });
}

module.exports = init;

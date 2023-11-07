const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

// Yeh neeche diya gaya code Passport ke liye local authentication strategy ko set up karta hai, including error handling, password comparison, aur session management. Node.js mein Passport ke saath authentication systems banane ke liye ye ek mahatvapurna hissa hai.

function init(passport) {                       // init function hai jo Passport ko initialize karta hai. Typically, is function ko aap apne mukhya application file (jaise server.js) mein call karte hain Passport authentication set up karne ke liye.
  passport.use(
    new LocalStrategy(                        // init function ke andar, hum local authentication ke liye strategy set karte hain 
      {
        usernameField: "email",                // hum isme "usernameField" ko "email" ke roop mein specify karte hain, jisse user ki email authentication ke liye username ke roop mein istemal hogi.
      },

      async (email, password, done) => {           // function tab call hota hai jab ek user login karne ki koshish karta hai. Ismein di gayi email aur password ko input ke roop mein liya jata hai.
        // login
        // check if email exist...
        const user = await User.findOne({ email: email });

        if (!user) {
          return done(null, false, { message: "No user with this email" });            // Agar koi user nahi milta, to done me pehla argument null diya jata hai, kyuki pehle args me done ke error diya jata hai, jisme ki abhi kuch errors nahi hain, aur authentication failure ke liye false. fir teesre argument mein ek error message bhi provide karte hain jisse ye pata chale ki uss email se koi user nahi mila.
        }
      
        bcrypt
          .compare(password, user.password)
          .then((match) => {                     // user dwara password enteredkiye jane per pehle compare hoga, agar wo comparing sucessful hogi tab aage ko execute hoga....
            if (match) {
              return done(null, user, { message: "logged in successfully" }); // user dwara entered password database me available password se match ho jane per ye line execute hogi...
            }

            return done(null, false, { message: "Wrong username or password" }); // user dwara entered password database se match na hone per ye line execute hogi...
          })
          .catch((err) => {                      // user dwara password entered kiye jane per agar compare karne me kuchh problome aayoi to use catch handle karega...,
            return done(null, false, { message: "Something went wrong" }); // password compareing issue..
          });
      }
    )
  );

  passport.serializeUser((user, done) => {        // Passport ki serialization aur deserialization methods implement karte hain user sessions ko manage karne ke liye. Jab ek user login karta hai, passport.serializeUser decide karta hai ki session mein kis user data ko store karna hai. Is case mein, wo user ka _id hai.
    done(null, user._id);                    // because 3rd parameter 'done' me optional hota hai isliye paas ni kiya gaya hai ...
  });

  passport.deserializeUser(async(id, done) => {               // passport.deserializeUser user session(jo ki mongoDB me stored hota hai) se user ko retrieve karta hai serialization ke dauran store ki gayi data ke adhar par. Ismein _id ke basis par user ko lookup kiya jata hai aur user object done ke saath return kiya jata hai.
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

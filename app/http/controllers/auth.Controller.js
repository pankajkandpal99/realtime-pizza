const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const passport = require("passport");

function authController() {
  const _getRedirectUrl = (req) => {          // iss function me ye check kiya gaya hai ki user ke role ke anusar hi use sahi jagah redirect karna hai...
    return req.user.role === 'ADMIN' ? '/admin/orders/' : '/customer/orders';
  }

  return {
    login(req, res) {
      res.render("auth/login");
    },

    // user login ke baad ka control postlogin handle karega...
    postLogin(req, res, next) {
      const { email, password } = req.body;
      // Validate request
      if (!email || !password) {
        req.flash("error", "All fields are required");
        return res.redirect("/login");
      }

      passport.authenticate("local", (err, user, info) => {            // isme jo second parameter callback function hai wo passport.config.js me done method se aane wale response se hi execute hoga...
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }

        if (!user) {                     // user ke nahi hone ka matlab hai ki ya to email exist nahi karti hai sessions me ya fir wrong password hai....in dono hi cases me passport error through karega...
          req.flash("error", info.message);
          return res.redirect("/login");
        }

        req.login(user, (err) => {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }

          return res.redirect(_getRedirectUrl(req));        
        });
      })(req, res, next);                          // iss line ka matlab ye hai ki passport.authenticate ek function return karta hai jisme ki 3 parameters hain.
    },

    register(req, res) {
      res.render("auth/register");
    },

    async postRegister(req, res) {
      const { name, email, password } = req.body;
      // Validate request
      if (!name || !email || !password) {
        req.flash("error", "All fields are required");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }

      // Check if email exists...
      const existingUser = await User.exists({ email: email });
      if (existingUser) {
        req.flash("error", "Email already register");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }

      // Create a user
      const user = new User({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
      });

      user
        .save()
        .then((user) => {
          // Login
          return res.redirect("/");
        })
        .catch((err) => {
          req.flash("error", "Something went wrong");
          return res.redirect("/register");
        });
    },

    logout(req, res, next) {
      req.logout((err) => {
        if (err) { 
          return next(err);
        }
      });
      return res.redirect('/login');
    }
  };
}

module.exports = authController;

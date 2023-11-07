require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const expressLayout = require("express-ejs-layouts");
// const initRoutes = require('./routes/web');
const session = require("express-session");
const flash = require("express-flash");
const MongoDBStore = require("connect-mongo");
const passport = require("passport");

const PORT = process.env.PORT || 3000;

// Database connection
const url = "mongodb://127.0.0.1:27017/realtime-pizza";
mongoose
  .connect(url)
  .then(() => {
    console.log("Successfully connected to mongoDB.");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false, // resave option sessions ko server par store karte samay user ki activity ke aadhar par session ko wapas save karne ki permission deta hai. Agar aap false set karte hain, to sessions tabhi save hongi jab koi change hota hai.
    saveUninitialized: false, //  Iss option ko aap apne requirement ke hisab se true ya false par set kar sakte hain. true par set karne se empty sessions bhi save hongi, jab user kuch bhi cart mein add nahi karta hai. false par set karne se, sessions tabhi save hongi jab kuch add kiya jata hai.
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours...
    store: MongoDBStore.create({
      // Configure MongoDB connection
      mongoUrl: url,
      collections: "sessions",
    }),
  })
);
app.use(flash());

// Passport config ---
app.use(passport.initialize());
app.use(passport.session());
const passportInit = require("./app/config/passport.config");
passportInit(passport);

// Session config works as a middleware..

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global middleware ... means har request per kaam karega...
app.use((req, res, next) => {
  res.locals.session = req.session;                      // req.session ek object hai jo user ki session data ko represent karta hai, jo Express.js session management system ke dwaara maintain hoti hai. res.locals.session session data ko res.locals object mein "session" naam ke variable mein store kar deta hai. Isse session data views ke liye available ho jata hai jab aap kisi response ko render karte hain. Yani ki, aap apne views mein session se related data ko access kar sakte hain jab aap views ko render karte hain.
  res.locals.user = req.user;                            // req.user ek object hai jo usually authenticate kiye gaye user ko represent karta hai. Yeh aksar user authentication wale applications mein istemal hota hai, jisse user ki information ko track kiya ja sake. res.locals.user user object ko res.locals object mein "user" naam ke variable mein store kar deta hai. Session data ki tarah, yeh user object bhi views ke liye available ho jata hai jab aap kisi response ko render karte hain. Isse aap apne HTML templates ya views mein user-specific information ko display kar sakte hain. layout.ejs me user ka use locally kiya gaya hai..
  next();
});

// set template engine...
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs"); // Jab aap app.set('view engine', 'ejs') use karte hain, to Express.js automatic roop se EJS ko require aur use karta hai.
app.use(express.static(path.join(__dirname, "public")));

require("./routes/web")(app);

app.listen(PORT, () => {
  console.log(`server is listening on PORT ${PORT}.`);
});

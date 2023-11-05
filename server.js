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

// Session config works as a middleware..
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
app.use(express.json());

// Global middleware ... means har request per kaam karega...
app.use((req, res, next) => {
  res.locals.session = req.session;
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

// 1:42:00

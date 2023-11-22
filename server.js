require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const expressLayout = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("express-flash");
const MongoDBStore = require("connect-mongo");
const passport = require("passport");
const Emitter = require("events"); // events is the built-in module in Node.js...

const PORT = process.env.PORT || 3000;

// Database connection
const url = process.env.MONGO_CONNECTION_URL;
mongoose
  .connect(url)
  .then(() => {
    console.log("Successfully connected to mongoDB.");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

// Event emitter
const eventEmitter = new Emitter(); // event ko emit karne ka matlab hai event ko trigger karna ya announce karna. Jab aap kisi event ko emit karte hain, to aap basically batane ki koshish kar rahe hain ki kuch specific hua hai ya hone wala hai. Emitting ek signal hota hai ki kisi particular action ya state change ka pata chala hai, jise dusre parts of the code (event listeners) sun sakte hain.
app.set("eventEmitter", eventEmitter); // app ke andar eventEmitter ko bind kar diya gaya hai isse hum eventEmitter ko kahi bhi use kar sakte hain.... Jab aap app.set('eventEmitter', eventEmitter); ka istemal karte hain, toh aap ek event emitter object ko Express.js application ke context mein set kar rahe hain. Yani, aap apne Express application ke liye ek global event emitter create kar rahe hain aur usse application ke context mein store kar rahe hain. Is tarah ka use case ho sakta hai jab aap multiple parts of your application ke beech communication karna chahte hain, aur event emitter ek event-driven approach ke liye ek common mechanism provide karta hai.

// Session config...
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
  res.locals.session = req.session; // req.session ek object hai jo user ki session data ko represent karta hai, jo Express.js session management system ke dwaara maintain hoti hai. res.locals.session session data ko res.locals object mein "session" naam ke variable mein store kar deta hai. Isse session data views ke liye available ho jata hai jab aap kisi response ko render karte hain. Yani ki, aap apne views mein session se related data ko access kar sakte hain jab aap views ko render karte hain.
  res.locals.user = req.user; // req.user ek object hai jo usually authenticate kiye gaye user ko represent karta hai. Yeh aksar user authentication wale applications mein istemal hota hai, jisse user ki information ko track kiya ja sake. res.locals.user user object ko res.locals object mein "user" naam ke variable mein store kar deta hai. Session data ki tarah, yeh user object bhi views ke liye available ho jata hai jab aap kisi response ko render karte hain. Isse aap apne HTML templates ya views mein user-specific information ko display kar sakte hain. layout.ejs me user ka use locally kiya gaya hai..
  next();
});

// set template engine...
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs"); // Jab aap app.set('view engine', 'ejs') use karte hain, to Express.js automatic roop se EJS ko require aur use karta hai.
app.use(express.static(path.join(__dirname, "public")));

require("./routes/web")(app);

app.use((req, res) => {
  res.status(404).render("error/ErrorPage.ejs", { layout: 'error/errorLayout'});
});

const server = app.listen(PORT, () => {
  console.log(`server is listening on PORT ${PORT}.`);
});

//  socket ....
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  const socketId = socket.id;
  // console.log(`User connected with Socket ID: ${socketId}`);     // Socket ID ek unique identifier hai jo ek socket connection ko represent karta hai. Socket ID generate hone ka matlab hai ki connection establish ho jana.  Jab bhi koi client server se connect hota hai, connection event trigger hota hai aur us connection ke liye ek unique socket ID generate hota hai. Is ID ko use karke server client ke sath communication karta hai.

  socket.on("join", (orderId) => {
    // Server-side code mein socket.on('join', ...) ka istemal ek event handler ke liye kiya gaya hai, jo ki client side se trigger ho ra hai /resources/app.js file me socket.emit function event ko trigger karne ke liye hota hai jo ki server-side per handler ho ra hai ...
    // console.log(orderId);
    socket.join(orderId);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  // 'on' method ka matlab hota hai ki event ko listen karna... on method ka istemal event ko listen karne ke liye hota hai. Jab aap kisi event ke liye on method ka istemal karte hain, to aap ek event listener register karte hain jo us event ko sunega (listen) aur us event ke occurrence par specific action lega.
  io.to(`order_${data.id}`).emit("orderUpdated", data); // isme id ko hum adminStatusController se bhej rahe hain... io.to(order_${data.id}).emit('orderUpdated', data); se yeh bataya ja raha hai ki specific ek room (ya channel) ko suna ja raha hai aur uss room mein connected sabhi clients ko orderUpdated event ke sath associated data bheja ja raha hai. Yahan, io socket.io instance ko represent karta hai, to(order_${data.id}) specific room (order_${data.id}) ko target karta hai, aur .emit('orderUpdated', data) specific room ke sabhi clients ko orderUpdated event ke sath associated data bhejta hai.
});

eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});


/*
eventEmitter.on("orderUpdated", (data) => {...});: Yeh line code ka mtlb hai ki "orderUpdated" event ko handle karne ke liye ek event listener register kiya gaya hai. Jab bhi "orderUpdated" event emit hoga, is listener ka callback function invoke hoga, jisme data parameter ke zariye event ke sath associated data ko receive kiya jaayega.

io.to(order_${data.id}).emit('orderUpdated', data);: Yeh line code ka mtlb hai ki jab "orderUpdated" event emit hota hai, to us event ke sath associated data (data) ko lekar, order_${data.id} room mein jo bhi clients hain, unko orderUpdated event ke sath update kiya jaayega.

io: Yeh socket.io instance ko represent karta hai.
.to(order_${data.id}): Yeh batata hai ki kis specific room(yaha specific room me hamare order ki hui product ki id hai) mein message bhejna hai. Yahan order_${data.id} room ka naam hai, jise event listener ke through receive kiya ja raha hai. (io.to(order_${data.id}).emit).
.emit('orderUpdated', data): Yeh bata raha hai ki kis event ko emit karna hai (orderUpdated) aur sath mein associated data bhi bhej raha hai (data).
*/

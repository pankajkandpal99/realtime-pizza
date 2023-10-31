const express = require("express");
const app = express();
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const PORT = process.env.PORT || 3000;

// set template engine...
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs"); // Jab aap app.set('view engine', 'ejs') use karte hain, to Express.js automatic roop se EJS ko require aur use karta hai.
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/cart", (req, res) => {
  res.render("customers/cart.ejs");
});

app.get("/login", (req, res) => {
  res.render("auth/login.ejs");
});

app.get("/register", (req, res) => {
  res.render("auth/register.ejs");
});

app.listen(PORT, () => {
  console.log(`server is listening on PORT ${PORT}.`);
});

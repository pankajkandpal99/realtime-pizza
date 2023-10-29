const express = require('express');
const app = express();
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.use(expressLayout);                           // Yeh line express-ejs-layouts middleware ko Express.js application me add kar rahi hai. Is middleware ka main kam layout-based templating system ko implement karna hai.
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');                    // Jab aap app.set('view engine', 'ejs') use karte hain, to Express.js automatic roop se EJS ko require aur use karta hai.
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`server is listening on PORT ${PORT}.`);
});
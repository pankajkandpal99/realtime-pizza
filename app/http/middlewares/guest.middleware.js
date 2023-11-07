function guest(req, res, next) {
  if (!req.isAuthenticated()) {                       // agar user logged in aur registered nahi hai to use login aur register wale route ka acces next ke roop me diya jayega, jo ki ye represent karta hai ki koi bhi loggedin aur registered user ko login aur register wale route ka access na mile .....
    return next();
  } else {
    return res.redirect("/");                         // aur agar user already logged in aur registered hai to use login aur register wale route ka acces nahi diya jayega aur use direct home page per redirect kar diya jayega.........
  }
}

module.exports = guest;

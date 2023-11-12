function adminMiddleware(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "ADMIN") {
    return next();
  } else {
    return res.redirect("/");
  }
}

module.exports = adminMiddleware;

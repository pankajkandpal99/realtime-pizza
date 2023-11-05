const HomeController = require("../app/http/controllers/home.controller");
const authController = require("../app/http/controllers/auth.controller");
const cartController = require("../app/http/controllers/customers/cart.Controller");

function initRoutes(app) {
  app.get("/", HomeController().index);
  app.get("/login", authController().login);
  app.get("/register", authController().register);
  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);
}

module.exports = initRoutes;

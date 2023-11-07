const HomeController = require("../app/http/controllers/home.controller");
const authController = require("../app/http/controllers/auth.Controller");
const cartController = require("../app/http/controllers/customers/cart.Controller");
const guestMiddleware = require('../app/http/middlewares/guest.middleware');

function initRoutes(app) {
  app.get("/", HomeController().index);
  app.get("/login", guestMiddleware, authController().login);
  app.post("/login", authController().postLogin);
  app.get("/register", guestMiddleware, authController().register);
  app.post("/register", authController().postRegister);
  app.post('/logout', authController().logout);

  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);
}

module.exports = initRoutes;

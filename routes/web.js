// controllers import
const HomeController = require("../app/http/controllers/home.controller");
const authController = require("../app/http/controllers/auth.controller");
const cartController = require("../app/http/controllers/customers/cart.controller");
const orderController = require("../app/http/controllers/customers/order.controller");
const adminOrderController = require('../app/http/controllers/admin/adminOrder.controller');
const adminStatusController = require('../app/http/controllers/admin/adminStatus.Controller');
//  middlewares import...
const guestMiddleware = require('../app/http/middlewares/guest.middleware');
const authMiddleware = require('../app/http/middlewares/auth.middleware');
const adminMiddleware = require('../app/http/middlewares/admin.middleware');

//  route handlers ...
function initRoutes(app) {
  app.get("/", HomeController().index);
  app.get("/login", guestMiddleware, authController().login);
  app.post("/login", authController().postLogin);
  app.get("/register", guestMiddleware, authController().register);
  app.post("/register", authController().postRegister);
  app.post('/logout', authController().logout);

  // cart related routes
  app.get("/cart", authMiddleware, cartController().index);
  app.post("/update-cart", cartController().update);

  // customer orders related routes....
  app.post('/orders', authMiddleware, orderController().store);
  app.get('/customer/orders', authMiddleware, orderController().index);
  app.get('/customer/order/:orderId', authMiddleware, orderController().show);

  // Admin routes ....
  app.get('/admin/orders', adminMiddleware, adminOrderController().index);
  app.post('/admin/order/status', adminMiddleware, adminStatusController().update);
}


module.exports = initRoutes;

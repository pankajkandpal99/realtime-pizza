function cartController() {
  return {
    index(req, res, next) {
      res.render("customers/cart.ejs");
    },

    update(req, res) {
      //  For the first time creating cart and adding basic object structure..
      if (!req.session.cart) {
        req.session.cart = {
          items: {},                         // iss items objetc me multiple item store honge jitna bhi user add karega client side se...
          totalQty: 0,
          totalPrice: 0,
        };
      }

      let cart = req.session.cart;
      // check if item doesn't exist in cart.
      if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
          item: req.body,                     // client side se add butto click karne per server ko jo update req bheji gayi usme pizza bheja gaya hai jo pizza ki poori detail contain karta hai aur ise handle home.ejs file kr rahi hai...
          qty: 1,
        };
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      } else {
        cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      }

      return res.json({ totalQty: req.session.cart.totalQty });
    },
  };
}

module.exports = cartController;

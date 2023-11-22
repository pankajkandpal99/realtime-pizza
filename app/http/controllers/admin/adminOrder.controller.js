const Order = require("../../../models/order.model");

function adminOrderController() {
  return {
    async index(req, res) {
      try {
        const orders = await Order.find(
          { status: { $ne: "completed" } },
          null,
          {
            sort: { 'createdAt': -1 },
          }
        ).populate("customerId", "-password");            // populate customerId except password...

        if (orders) {
          // console.log(orders);
          if (req.xhr) {                         // This checks if the request is an XMLHttpRequest (Ajax) request.
            // console.log(orders);
            return res.json(orders);
          } else {   
            // console.log(orders);                            
            return res.render("admin/orders.ejs");               // If the request is not an Ajax request, it means it's a regular page request (probably navigating directly to the URL). In this case, it goes to the else block.
          }
        }
      } catch (err) {
        console.log(err.message);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error." });
      }
    },
  };
}

module.exports = adminOrderController;

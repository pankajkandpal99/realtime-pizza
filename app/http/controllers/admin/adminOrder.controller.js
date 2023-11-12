const Order = require("../../../models/order.model");

function adminOrderController() {
  return {
    async index(req, res) {
      // populate method ka use tab hota hai jab ek model ke andar dusre model ka refrence liya gaya ho. tab agar hame uss refrence liye gaye model ki bhi sari details chiye hoti ho to uss case me populate method ka use kiya jata hai...
      try {
        const orders = await Order.find(
          { status: { $ne: "completed" } },
          null,
          {
            sort: { 'createdAt': -1 },
          }
        ).populate("customerId", "-password"); // populate ke andar customerId dene ka matlab hai ki Order ke andar jo customerId hai uski jagah wo jis customer ki wo id hai uska wo poora detail nikal ke le aayega... aur minus password ka matlab hai ki uss password me password ni aayega...

        if (orders) {
          // console.log(orders);
          if (req.xhr) {                         // This checks if the request is an XMLHttpRequest (Ajax) request.
            // console.log(orders);
            return res.json(orders);
          } else {   
            // console.log(orders);                            // If the request is not an Ajax request, it means it's a regular page request (probably navigating directly to the URL). In this case, it goes to the else block.
            return res.render("admin/orders.ejs");
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

const Order = require("../../../models/order.model");

// user ke order status ke anusar ye controller banaya gaya hai... like order placed, confirmed, etc..... Aur ye status checking kewal Admin hi kar sakta hai...
function adminStatus() {
  return {
    async update(req, res) {
      try {
        await Order.updateOne({ _id: req.body.orderId }, { status: req.body.status });              // Ye document dhundhta hai jiska _id req.body.orderId ke ke sath match karta hai. Document ko req.body.status se specified status ke sath update karta hai.
        //  Emit event...
        const eventEmitter = req.app.get('eventEmitter');           // server.js file me set kiya gaya eventEmitter yaha get karke emit kiya ja ra hai, jise waha bind kar diya gaya tha. fir ise listen karne ke liye dobara server.js file me jana padega ....
        eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });
        
        return res.redirect("/admin/orders");
      } catch (err) {
        console.error(err);
        return res.redirect("/admin/orders");           //  It ensures that the user stays on the same page even if an error occurs. This can be beneficial to provide a seamless experience, especially if the error is minor and doesn't warrant a significant interruption. If there's an issue with the update, redirecting to the same page might be the safest fallback option. This way, the user is not left on a broken or incomplete state.
      }
    },
  };
}

module.exports = adminStatus;

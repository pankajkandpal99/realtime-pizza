const Order = require("../../../models/order.model");
const moment = require("moment");

function orderController() {
  // here we are using factory functions, so orderController is return a object ....
  return {
    async store(req, res) {
      try {
        let { phone, address } = req.body;
        //   console.log(phone, address);
        if (!phone || !address) {
          req.flash("error", "All fields are required!");
          return res.redirect("/cart");
        }

        const order = new Order({
          customerId: req.user._id, // logged in user ko passport library req ke upper user available karwa deti hai jisse hum uss user ki _id ko nikal sakte hain...
          items: req.session.cart.items,
          phone: phone,
          address: address,
        });

        await order.save();
        const placedOrder = await Order.populate(order, { path: "customerId" });
        if(placedOrder){
          
          req.flash("success", "Order placed successfully.");
          delete req.session.cart;                  // order place hone ke baad cart empty ho jayega...

          // Emit
          const eventEmitter = req.app.get("eventEmitter");
          eventEmitter.emit("orderPlaced", placedOrder); // iske baad ise server.js per listen kiya ja sakta hai ...

          return res.redirect("customer/orders");
        }
      } catch (err) {
        console.log("Error occured while you are saving order : ", err);
        req.flash("Something went wrong!");
        return res.redirect("/cart");
      }
    },

    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      }); // jo user loggedIn hoga usi ke order dikhaye jaynege...aur date ke anusar sort kiye jayenge... aur humne timing ke anusar unhe sort bhi kiya hai jisse order descending order me save honge...
      // console.log(orders);

      res.header(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-state=0, post-check=0, pre-check=0"
      ); // Yeh headers generally dynamic content ke liye use hote hain jise har baar fresh data chahiye, aur caching ko avoid karna chahiye. Isse ensure hota hai ki har request pe fresh data server se fetch hota hai. dynamic content, jaise ki user-specific data, har baar fresh hona chahiye. Agar aapne kuch order kiya hai aur aap apne orders dekh rahe hain, toh aapko har baar latest orders dikhne chahiye, na ki cache mein stored orders. Cache-Control headers browser ko batati hain ki kaise caching karna chahiye. Upar diye gaye headers no-cache, private, no-store, must-revalidate wagerah yehi batate hain ki browser ko fresh content har baar server se lena chahiye aur cache ko ignore karna chahiye.
      res.render("customers/order.ejs", { orders, moment }); // isme moment field time ke liye hai...
    },

    async show(req, res) {
      let { orderId } = req.params;
      const order = await Order.findById(orderId);
      // Authorized user...
      if (req.user._id.toString() === order.customerId.toString()) {
        // only usi user ka hame order tracking dekhni hai jo loggedIn hai. kyuki database me available document ki id(_id) ek object ke roop me available hoti hai aur customerId bhi ek object ke roop me hi available hai to aise me hum dono objects ko aapas me compare nahi kar sakte hain... isliye pehle hame unhe string me convert karna hoga fir compare karke check kar sakte hain ki kon sa user loggedIn hai...
        return res.render("customers/singleOrder.ejs", { order });
      }

      return res.redirect("/"); // unAuthorised user ko singleOrder.ejs file ka access nahi diya jayega...
    },
  };
}

module.exports = orderController;

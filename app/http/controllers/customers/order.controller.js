const Order = require("../../../models/order.model");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const moment = require("moment");

function orderController() {
  // here we are using factory functions, so orderController is return a object ....
  return {
    async store(req, res) {
      try {
        let {
          phone,
          address,
          stripeToken,
          payment_type: paymentType,
        } = req.body;

        // console.log(req.body);
        if (!phone || !address) {
          return res.status(422).json({ message: "All fields are required!" });
        }

        // Order creation
        const order = new Order({
          customerId: req.user._id, // logged in user ko passport library req ke upper user available karwa deti hai jisse hum uss user ki _id ko nikal sakte hain...
          items: req.session.cart.items,
          phone: phone,
          address: address,
        });

        // Order save in database...
        await order.save();
        const placedOrder = await Order.populate(order, { path: "customerId" });
        if (placedOrder) {
          // console.log(placedOrder);

          // Stripe payment....
          if (paymentType === "card") {
            // console.log(`Payment type:  ${paymentType}`);

            const source = await stripe.sources.create({
              type: 'card',
              token: stripeToken
            });

            try {
              await stripe.paymentIntents.create({        // As per latest RBI guidelines, Stripe has switched from Charges API to Payment Intent API.
                amount: req.session.cart.totalPrice * 100, // rupees ko paise me convert kiya gaya hai ...
                source: source.id,                          // Jab aap stripe.sources.create ka istemal karte hain, aapke pass ek response aata hai, jisme source ka sara data hota hai, aur isme id field mein ek unique identifier hota hai. Aapko chahiye ki aap iss unique identifier ko stripe.paymentIntents.create method ke source parameter mein provide karein, taaki Stripe sahi source ko identify kar sake aur transaction complete ho sake.
                currency: "inr",
                description: `Pizza order: ${placedOrder._id}`,
              });

              // console.log(paymentIntent);
              // console.log(placedOrder);
              placedOrder.paymentStatus = true; // ye palcedOrder ke andar jo paymentStatus hai wo model me already defined hai jise ki yaha payment milne ke baad true kiya ja ra hai ki payment mil gaya hai ise true kar do...
              placedOrder.paymentType = paymentType;
              const ord = await placedOrder.save();
              // console.log(ord);
              if (!ord) {
                console.log("ord not saved: ", err);
              }
              // Emit
              const eventEmitter = req.app.get("eventEmitter");
              eventEmitter.emit("orderPlaced", ord); // iske baad ise server.js per listen kiya ja sakta hai ...
              delete req.session.cart; // order place hone ke baad cart ke sare items delete ho jayenge aur cart empty ho jayega...
              return res.json({
                message: "Payment Successfull, Order placed successfully.",
              });

            } catch (err) {
              // payment error handling....
              console.log(
                "Error Occuring while fetching orders placing time. Orders placed, but Payment failed : ",
                err
              );
              delete req.session.cart; // order place ho gayi hai aur payment me issue hai...
              return res.json({
                message:
                  "OrderPlaced but Payment failed, You can pay at delivery time.",
              });
            }
          } else {           // cod ke liye...
            delete req.session.cart;    
            return res.json({ message: "Order placed successfully." });
          }
        }
      } catch (err) {
        console.log("Error occured while you are saving order : ", err);
        return res.status(500).json({ message: "Something went wrong!" });
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

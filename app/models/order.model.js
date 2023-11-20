const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    customerId: {
      // kon sa user order kar ra hai uski bhi _id compulsary rahegi...
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      // user jo items ko order kar raha hai... ye items key hum session se lenge jo humne cart ke andar items store kiye the...
      type: Object,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    paymentType: {                              // ye order karne ke baad payment karne ke liye hai .....
      type: String,
      default: "COD",
    },

    paymentStatus: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      default: "order-placed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
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

    paymentType: {                              // This line is for specially doing payment after ordered pizzas..
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

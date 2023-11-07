const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "CUSTOMER",
    },
  },

  { timestamps: true }                    // createdAt and updatedAt db me store ho jayega....
);

module.exports = mongoose.model("User", userSchema);

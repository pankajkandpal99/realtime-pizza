const mongoose = require("mongoose");

const menueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  size: {
    type: String,
    required: true,
  },
});

const Menue = mongoose.model("Menue", menueSchema);
module.exports = Menue;

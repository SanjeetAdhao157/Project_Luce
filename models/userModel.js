const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = require("../models/ProductModel");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },

  cart: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product", 
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
});

userSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model("User", userSchema);

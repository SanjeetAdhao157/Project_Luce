const mongoose = require("mongoose");
const dbUrl = process.env.ATLASTDB_URL;
mongoose.connect(dbUrl);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { 
    url: String,
    filename:String,   
   },
  discount: { type: Number, default: 0 },
  itemType: {
    type: String,  
    enum: ["shoes", "bags", "watches"], 
    required: true,
  },
  owner : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
 
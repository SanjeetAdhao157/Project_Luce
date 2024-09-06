const { storage } = require("../CloudConfig.js");
const multer = require("multer");
const upload = multer({ storage });

const Product = require("../models/ProductModel");
module.exports.allProduct = async (req, res, next) => {
  let product = await Product.find();
  res.render("shop/shop", { product });
};

module.exports.singleProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    req.flash("error", "Product Does Not Exist");
    res.redirect("shop/shop");
  }
  res.render("shop/show", { product });
};

module.exports.productCategory = async (req, res) => {
  const { itemtype } = req.params;
  const product = await Product.find({ itemType: itemtype });
  res.render("shop/shop", { product });
};

module.exports.getEditProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    req.flash("error", "Product Does Not Exist");
    res.redirect("shop/shop");
  }
  res.render("shop/edit", { product });
};
module.exports.postEditProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    req.flash("error", "Product Does Not Exist");
    return res.redirect("/shop");
  }

  if (req.file) {
    const { path: url, filename } = req.file;
    product.image = { url, filename };
  }

  product.name = req.body.name;
  product.price = req.body.price;
  product.description = req.body.description;
  product.discount = req.body.discount;
  product.itemType = req.body.itemType;

  await product.save();
  req.flash("success", "Product Updated Successfully");
  res.redirect(`/shop/${id}`);
};

module.exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  req.flash("success", "Product Deleted");
  res.redirect("/shop");
};

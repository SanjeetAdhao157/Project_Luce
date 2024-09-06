const Product = require("./models/ProductModel");
const productJoiSchema = require("./schema");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a new product");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let product = await Product.findById(id);
  if (!product.owner || !product.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not authorized to edit this product");
    return res.redirect("/shop");
  }
  next();
};

module.exports.validateProduct = (req, res, next) => {
  let { error } = productJoiSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

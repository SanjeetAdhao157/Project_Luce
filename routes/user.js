const express = require("express");
const router = express.Router();
const Product = require("../models/ProductModel");
const wrapAsync = require("../utils/wrapAsync.js");
const productJoiSchema = require("../schema.js");
const User = require("../models/userModel.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/cart",userController.renderCart);

router.post("/cart", isLoggedIn, wrapAsync(userController.postCart));

router.post('/cart/delete/:itemId', userController.removeItemFromCart);

router.get("/signup", userController.renderSignup);

router.post("/signup", wrapAsync(userController.postSignup));

router.get("/login", userController.renderLogin);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.postLogin
);

router.get("/logout", userController.logout );



module.exports = router;



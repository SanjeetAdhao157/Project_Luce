const express = require("express");
const router = express.Router();
const Product = require("../models/ProductModel");
const wrapAsync = require("../utils/wrapAsync.js");
const productJoiSchema = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, validateProduct } = require("../middleware.js");
const shopController = require("../controllers/shops.js");
const multer  = require('multer')
const { storage } = require('../CloudConfig.js');
const upload = multer({ storage })


router.get("/", wrapAsync(shopController.allProduct));


router.get("/:id", wrapAsync(shopController.singleProduct));

router.get("/category/:itemtype", wrapAsync(shopController.productCategory));

router.get(
  "/:id/Edit",
  isLoggedIn,
  isOwner,
  wrapAsync(shopController.getEditProduct)
);

router.put(
  "/:id/update",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  validateProduct,
  wrapAsync(shopController.postEditProduct)
);

router.delete(
  "/:id/Delete",
  isLoggedIn,
  isOwner,
  wrapAsync(shopController.deleteProduct)
);

module.exports = router;

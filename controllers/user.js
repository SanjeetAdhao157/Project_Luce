const User = require("../models/userModel");
const Product = require("../models/ProductModel");

module.exports.postSignup = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Successfully registered, Welcome to Luce!");
      res.redirect("/");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

module.exports.renderSignup = (req, res) => {
  res.render("users/signup");
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.postLogin = async (req, res) => {
  req.flash("success", "Welcome Back!");
  let redirectUrl = res.locals.redirectUrl || "/";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "Logged Out!");
    res.redirect("/");
  });
};

module.exports.renderCart = async (req, res) => {
  const user = req.user;

  if (!user) {
    req.flash("error", "You must be logged in to view the cart");
    return res.redirect("/login");
  }

  const cartItems = await Promise.all(
    user.cart.map(async (item) => {
      const product = await Product.findById(item.productId);
      return {
        ...item.toObject(),
        product,
      };
    })
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  res.render("users/cart", { cartItems, totalItems, totalPrice, user });
};

module.exports.postCart = async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const user = req.user;
    if (!user) {
      req.flash("error", "You must be logged in to add items to the cart");
      return res.redirect("/login");
    }

    const product = await Product.findById(id);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/");
    }

    const cartItem = user.cart.find((item) =>
      item.productId.equals(product._id)
    );

    if (cartItem) {
      cartItem.quantity += parseInt(quantity, 10);
    } else {
      user.cart.push({
        productId: product._id,
        quantity: parseInt(quantity, 10),
      });
    }

    await user.save();

    req.flash("success", "Product added to cart successfully");
    res.redirect("/shop");
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/");
  }
};

exports.removeItemFromCart = async (req, res, next) => {
  const { itemId } = req.params;
  const user = req.user; // User object obtained from authentication middleware
  try {
    // Find the user and remove the item from their cart
    const userUpdateResult = await User.findOneAndUpdate(
      { _id: user._id }, // Find the user by their ID
      { $pull: { cart: { _id: itemId } } }, // Remove the cart item with the matching _id
      { new: true } // Return the updated document
    );

    // Check if the user was found and the item was removed
    if (!userUpdateResult) {
      req.flash(
        "error",
        "Failed to remove item from cart. It might not exist."
      );
      return res.redirect("/cart");
    }

    req.flash("success", "Item removed from cart.");
    res.redirect("/cart");
  } catch (error) {
    next(error); // Pass errors to the error-handling middleware
  }
};

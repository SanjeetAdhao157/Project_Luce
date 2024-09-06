if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const ejsMate = require("ejs-mate");
const Product = require("./models/ProductModel");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const productJoiSchema = require("./schema.js");
const shop = require("./routes/shops.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/userModel.js");
const user = require("./routes/user.js");
const { isLoggedIn } = require("./middleware.js");
const { validateProduct } = require("./middleware.js");
const multer = require("multer");
const { storage } = require("./CloudConfig.js");
const upload = multer({ storage });
const dbUrl = process.env.ATLASTDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.error("Error in Mongo Session Store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.get("/About", (req, res) => {
  res.render("About");
});

app.use("/", user);

app.listen(port, (req, res) => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/create", isLoggedIn, (req, res) => {
  res.render("shop/create");
});

app.post(
  "/create",
  isLoggedIn,
  upload.single("image"),
  validateProduct,
  wrapAsync(async (req, res) => {
    const { name, price, discount, itemType, description } = req.body;
    let url = req.file.path;
    let filename = req.file.filename;
    const userID = req.user._id;
    const product = await Product.create({
      name,
      price,
      image: { url, filename },
      discount,
      itemType,
      description,
      owner: userID,
    });
    req.flash("success", "Product Added successfully");
    res.redirect("shop");
  })
);

app.use("/shop", shop);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error", { message });
  
});

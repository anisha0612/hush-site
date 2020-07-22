import express from "express";
import indexRoute from "./routes/index.js";
import mongoose from "mongoose";
import { User, Post } from "./models/User.js";
import flash from "connect-flash";
import session from "express-session";
import passport from "passport";

const app = express();

import myFunc from "./config/passport.js";
myFunc(passport);

// ejs
app.set("view engine", "ejs");

// Body-parser
app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// Express session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
// configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// use static files(stylesheets)
app.use(express.static("public"));
// routes
app.use("/", indexRoute);

// passport config

// import "x./config/passport.js";

// database connection

mongoose
  .connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDb connected."))
  .catch((err) => console.log(err));

mongoose.set("useCreateIndex", true);

const PORT = process.env.PORT || 3100;

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});

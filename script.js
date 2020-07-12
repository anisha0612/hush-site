import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import session from "express-session";
import local from "passport-local";
import dotenv from "dotenv";

dotenv.config();

const LocalStrategy = local.Strategy;

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// local.strategy.js setup

passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    });
  })
);

// session configuration
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// configure passport
app.use(passport.initialize());
app.use(passport.session());

// mongoose database connection

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// passport plugin to mongoose schema
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// root route
app
  .route("/")
  .get((req, res) => {
    res.render("home");
  })
  .post((req, res) => {
    req.body.button === "login" ? res.render("login") : res.render("register");
  });

// login route
// app
//   .route("/login")
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  passport.authenticate("local", {
    successRedirect: res.render("secrets"),
    failureRedirect: res.redirect("login"),
    failureFlash: true,
  });
});
// register route

// app
//   .route("/register")
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (request, response) => {
  User.register(
    new User({ username: request.body.email }),
    request.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        return response.render("register");
      } else {
        passport.authenticate("local", {
          successRedirect: response.render("secrets"),
          failureRedirect: response.redirect("register"),
          failureFlash: true,
        });
      }
    }
  );
});
//logout
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// secrets route
app
  .route("/secrets")
  .get((req, res) => {
    //   res.isAuthenticated() ? res.render("secrets") : res.render("/login");
  })
  .post((req, res) => {
    req.body.button === "submit" ? res.render("submit") : res.render("home");
  });

// submit

app.listen(3100, () => {
  console.log(`Server running at port 3100`);
});

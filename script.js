import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose database connection

mongoose.connect("mongodb://localhost:27017/secretsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

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
app.route("/login").get((req, res) => {
  res.render("login");
});

// register route

app.route("/register").get((req, res) => {
  res.render("register");
});

// secrets route
app.route("/secrets").get((req, res) => {
  res.render("secrets", { secrets: secrets });
});

app.listen(3100, () => {
  console.log(`Server running at port 3100`);
});

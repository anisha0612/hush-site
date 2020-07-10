import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
// import encrypt from "mongoose-encryption";
import md5 from "md5";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose database connection

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// const secret = process.env.LONG_STRING;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

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
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.email;
    const password = req.body.password;
    User.findOne(
      ({ email: username, password: password },
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          res.render("secrets");
        }
      })
    );
  });

// register route

app
  .route("/register")
  //   .get((req, res) => {
  //     res.render("register");
  //   })
  .post((req, res) => {
    const newUser = new User({
      email: req.body.email,
      password: md5(req.body.password),
    });
    newUser.save((err) => {
      if (!err) {
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  });

// secrets route
app.route("/secrets").post((req, res) => {
  req.body.button === "submit" ? res.render("submit") : res.render("home");
});

// submit

app.listen(3100, () => {
  console.log(`Server running at port 3100`);
});

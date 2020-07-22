import express from "express";
import validate from "express-validator";
import { User, Post } from "../models/User.js";
import bycrpt from "bcrypt";
import passport from "passport";
import local from "passport-local";

const { check, body, validationResult } = validate;
const app = express();

const passwdValidate = (name, email, password) => {
  let errors = [];
  if (!name || !email || !password) {
    errors.push({
      msg: "Fields should not be empty",
    });
  }
  if (!name.match(/^[a-zA-Z]{3,}$/)) {
    errors.push({
      msg: "Please enter a valid name",
    });
  }
  if (
    !password.match(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$.!%*#?&])[A-Za-z\d@$.!%*#?&]{6,}$/
    )
  ) {
    errors.push({
      msg:
        "Password should be minimum 6 characters, at least 1 letter, 1 number and 1 special character",
    });
  }
  return errors;
};

app
  .route("/")
  .get((req, res) => {
    res.render("home");
  })
  .post((req, res) => {
    req.body.button === "login" ? res.render("login") : res.render("register");
  });

// register

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post([body("email").normalizeEmail()], (req, res) => {
    const { name, email, password } = req.body;
    let errors = [];
    errors = passwdValidate(name, email, password);

    if (errors.length > 0) {
      res.render("register", { errors: errors });
    } else {
      User.findOne({ email: email }).then((user) => {
        if (user) {
          errors.push({ msg: "Email is already registered" });
          res.render("register", { errors: errors });
        } else {
          const newUser = new User({ name, email, password });
          const post = new Post({
            content: "Welcome! Pen down your thoughts. Enjoy!",
            owner: `${newUser._id}`,
          });
          post.save((err, post) => {
            if (err) throw err;
            else {
              bycrpt.genSalt(12, (err, salt) => {
                bycrpt.hash(newUser.password, salt, (err, hash) => {
                  if (err) {
                    console.log(err);
                    res.redirect("register");
                  } else {
                    newUser.password = hash;
                    newUser.posts.push(post.ObjectId);
                    newUser.save();
                    req.flash(
                      "success_msg",
                      "You have been registered, you can now log in"
                    );
                    res.redirect("login");
                    // Post.find({ owner: newUser.ObjectId }, (err, posts) => {
                    //   console.log(posts);
                    //   if (err) throw err;
                    //   else {
                    //     res.render("secrets", { posts: posts });
                    //   }
                    // });
                  }
                });
              });
            }
          });
        }
      });
    }
  });

// login
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res, next) => {
    passport.authenticate(
      "local",
      {
        successRedirect: "secrets",
        failureRedirect: "/login",
        failureFlash: true,
      },
      (err, user, info) => {
        console.log(user);
        console.log(info);
      }
    )(req, res, next);
  });

//logout
app.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("login");
});

const isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect("/login");
};

// secrets route
app
  .route("/secrets")
  .get(isAuthenticated, (req, res, next) => {
    res.render("secrets");
  })
  .post((req, res) => {
    req.body.button === "submit" ? res.render("submit") : res.render("home");
  });

// submit
app.get("/submit", (req, res) => {
  res.render("submit");
});
app.post("/submit", (req, res) => {
  const post = new Post({ content: req.body.content, owner: person.id });
  post.save((err) => {
    if (!err) {
      console.log(post);
      res.render("secrets", { posts: post });
    }
  });
});

export default app;

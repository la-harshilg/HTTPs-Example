const express = require("express");
const https = require("https");
const app = express();
const fs = require("fs");
const helmet = require("helmet");
require("dotenv").config();

const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log("Google Profile : ", profile);
  done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

app.use(helmet());
app.use(passport.initialize());
app.use(express.static(__dirname));

function checkLoggedIn(req, res, next) {
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must log in.",
    });
  }
  next();
}

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: false,
  }),
  (req, res) => {
    console.log("Google called us back.");
  }
);

app.get("/auth/logout", (req, res) => {});

app.get("/failure", (req, res) => {
  res.send("Fail to logged in.");
});

app.get("/secret", checkLoggedIn, (req, res) => {
  res.send("Your secret value is 22.");
});

https
  .createServer(
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(8000, () => {
    console.log("Server listening to 8080 PORT.........");
  });

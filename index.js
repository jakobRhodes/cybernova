// File Name
// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const {body, validationResult } = require("express-validator");
const bodyParser = require('body-parser');
require("dotenv").config();
const authRouter = require("./auth");
const oracledb = require('oracledb');

/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "3000";
const connString = '(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=gc9da1e68817696_cybernovadatabase_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
//Changes the return format to an array of JavaScript Objects
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// Commits
oracledb.autoCommit = true;
//Required to read body variables
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Development Variables
let commentSectionEnabled = true;
let databaseRequests = 0;
let date = new Date();
let maximumRequests = 250;

/**
 * Session Configuration (New!)
 */
const session = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: false
};

if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true;
}


/**
 * Passport Configuration (New!)
 */
const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile);
  }
);


/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSession(session));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Creating custom middleware with Express
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use("/", authRouter);

/**
 * Routes Definitions
 */
const secured = (req, res, next) => {
  if (req.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};


app.get('/', function (req, res) {
  //Changes the return format to an array of JavaScript Objects
  async function getCommentData() {

      const connection = await oracledb.getConnection ({
          user          : "MERCANIST",
          password      : 'CyberPunkLucy51!',
          connectString : connString
      });
      //SQL COMMANDS
      const retreive = await connection.execute(`SELECT * FROM COMMENTS`);
      await connection.execute('UPDATE DATABASE' + 'SET REQUESTS = REQUESTS + 1');
      //Set data to contain only rows
      var data = retreive.rows;
      //console.log(data);
      await connection.close();
      //Render Home Page with data as acessible variable
      res.render('index', {data: data});
    }
    //Run the async function
    //Reset request counter on the first day of the month
    if (date.getDate() == 1) {
      databaseRequests = 0;
    }
    //Check that comment section is enabled and able to be used
    if (commentSectionEnabled) {
      //Async Function
      getCommentData();
    }
    else 
      res.render('index', {commentSectionEnabled: commentSectionEnabled});
});

//Login
app.get("/user", secured, (req, res, next) => {
  const { _raw, _json, ...userProfile } = req.user;
  res.render("user", {
    title: "Profile",
    userProfile: userProfile
  });
});

//Form GET
app.get("/comment", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//Form POST
app.post("/comment", [
  body('name').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('text').trim().escape()], 
(req, res) => {
  async function insertComment() {
      const connection = await oracledb.getConnection ({
          user          : "MERCANIST",
          password      : 'CyberPunkLucy51!',
          connectString : connString
      });
      var commentorName    = req.body.name;
      var commentorEmail   = req.body.email;
      var commenterComment = req.body.text;
      console.log('INSERT INTO COMMENTS' +
      ' VALUES (' + '\'' + commentorName + '\'' + ', ' + '\'' + commentorEmail + '\'' + ', ' + '\'' + commenterComment + '\'' + ')');
      const result = await connection.execute('INSERT INTO COMMENTS' +
      ' VALUES (' + '\'' + commentorName + '\'' + ', ' + '\'' + commentorEmail + '\'' + ', ' + '\'' + commenterComment + '\'' + ')');
      await connection.close();
      let data 
      res.redirect('/');
    }
    if (commentSectionEnabled)
      insertComment();
});

app.get("/wip", (req, res) => {
  res.render('template');
});

app.get("/about", (req, res) => {
  res.render('template');
});

app.get("/contact", (req, res) => {
  res.render('template');
});

app.get("/support", (req, res) => {
  res.render('template');
});


/**
 * Server Activation
 */
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`); 
});
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");
const PORT = 20001; // default port 8082
app.set("view engine", "ejs"); // tells express to use ejs as the templating engine 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users ={
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
const generateRandomString = function() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};
//check to see if submitted email from registration form already exists in urser database //
const exsitingUser = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
    return false;
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {};
  
  const cookie = req.cookies["username"];
  if(cookie) {
    templateVars["urls"] = urlDatabase;
    templateVars["username"] = cookie;
  } else {
    templateVars["urls"] = urlDatabase;
    templateVars["username"] = "";
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  // server generates a shortURI, and adds it to the urlDatabase
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");//html art => making "hello" bold 
// });

app.get("/register", (req, res) => {
  const templateVars = {username: res.cookie["user"]};
  res.render("urls_registration", templateVars);
});

//-------------------POST---------------------------------------------------------------//

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/:shortURL`);         // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  // console.log("URL deleted", URLToBeDeleted)
  res.redirect("/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => {
   console.log(req.params.shortURL);
   console.log(req.body.longURL);
   //console.log(urlDatabase[req.params.shortURL])

   urlDatabase[req.params.shortURL] = req.body.longURL;
  // console.log("URL deleted", URLToBeDeleted)
  res.redirect("/urls");
});


app.post('/login', (req, res) => {
  const username = req.body.username;
  
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const submitEmail = req.body.email;
  const submitPassword = req.body.password;

  if (!submitEmail || !submitPassword) {
    res.status(400).send("please enter a valid email address and a password");
  };
  
  if (exsitingUser(submitEmail)) {
    res.send(400, "An account already exists under this email address, please try again");
  };

  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: submitEmail,
    password: submitPassword
  };
  res.cookie('user_id', newUserId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

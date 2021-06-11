const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");
const PORT = 20001; // default port 8082
app.set("view engine", "ejs"); // tells express to use ejs as the templating engine 
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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
      return users[user].id
    } 
  }
  return false;
};
const urlsForUser = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls; 
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"},
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
 
  let templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  } 
  res.render("urls_new", templateVars);
  
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL.longURL],
    urlUserID: urlDatabase[req.params.shortURL].userID,
    user: users[req.cookies["user_id"]],
  }; 
  console.log(templateVars.urlUserID, "printing hereeeeeee")
  res.render("urls_show", templateVars);
});

// Redirect to the corresponding long URL, from the urlDatabase
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send(302);
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };
  console.log(templateVars);
  res.render("urls_login", templateVars);
});
//-------------------POST---------------------------------------------------------------//

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/:${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const userUrls = urlsForUser(userID);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  }
  res.send(401);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies["user_id"];
  const userUrls = urlsForUser(userID);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  res.send(401);
});

app.post('/urls/:shortURL/edit', (req, res) => {
   console.log(req.params.shortURL);
   console.log(req.body.longURL);
   //console.log(urlDatabase[req.params.shortURL])

   urlDatabase[req.params.shortURL] = req.body.longURL;
  // console.log("URL deleted", URLToBeDeleted)
  res.redirect("/urls");
});


app.post('/login', (req, res) => { //update: endpoint to look up email address

  const email = req.body.email;
  const password = req.body.password;
  
  if(!exsitingUser(email)) {
    res.status(403).send("No account associated with this email address")
  } else {
    const userID = exsitingUser(email);
    if (users[userID].password !== password) {
      res.sendStatus(403).send("Incorrect Password, Please Try Again");
    } else {
      res.cookie('user_id', userID);
      res.redirect('/urls');
    }
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const submitEmail = req.body.email;
  const submitPassword = req.body.password;

  if (!submitEmail || !submitPassword) {
    res.status(400).send("please enter a valid email address and password");
  };
  
  if (exsitingUser(submitEmail)) {
    res.send(400, "An account already exists under this email address, please try again");
  };

  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: submitEmail,
    password: submitPassword //hashing
  };
  res.cookie('user_id', newUserId);
  res.redirect("/urls");
});



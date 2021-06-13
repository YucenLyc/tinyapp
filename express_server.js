const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { render } = require("ejs");
app.set("view engine", "ejs");
const bcrypt = require("bcryptjs");
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 20004;

app.use(cookieSession({
  name: 'session',
  keys: ['SAyWhat', 'icecream'],
}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const users = {
};
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
};

const { //calling functions stored in helpers.js
  generateRandomString,
  hasUserEmail,
  getUserbyEmail,
  urlsForUser,
  cookieHasUser
} = require("./helpers");

app.get("/", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


app.get("/urls", (req, res) => {

  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!cookieHasUser(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_registration", templateVars);
  }
});


app.get("/login", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});


app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL.userID],
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
    
  } else {
    res.status(404).send("The Short URL you entered does not correspond with a long URL at this time.")
    
  }
});


// Redirect to the corresponding long URL, from the urlDatabase
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The Short URL you are trying to access does not correspond with a long URL.");
  }
});


app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You Must Log In before Createing Short URLs.")
  }
});


app.post('/register', (req, res) => {
  const submitEmail = req.body.email;
  const submitPassword = req.body.password;

  if (!submitEmail || !submitPassword) {
    res.status(400).send("please enter a valid email address and password");
  } else if (hasUserEmail(submitEmail, users)) {
    res.status(400).send("An account already exists under this email address, please try again");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: submitEmail,
      password: bcrypt.hashSync(submitPassword, 10),
    };
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});


app.post('/login', (req, res) => { //update: endpoint to look up email address
  const email = req.body.email;
  const password = req.body.password;

  if (!hasUserEmail(email, users)) {
    res.status(403).send("No account associated with this email address");
  } else {
    const userID = getUserbyEmail(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.sendStatus(403).send("Password Does Not Match With the Email Provided, Please Try Again");
    } else {
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  }
});


app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  const userID = req.session["user_id"];
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect("/urls");
  }
  res.status(401).send("You Are Not Authorized to Edit this Short URL.");
});


app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.send(401).send("You Are Not Authorized To Delete This Short URL.");
});

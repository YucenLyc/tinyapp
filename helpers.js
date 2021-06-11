
const generateRandomString = function() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};

// Check if given email matches with a user in the database, returns a boolean
const hasUserEmail = function (email, userDatabase) {
  for (const user in userDatabase){
    if (userDatabase[user].email === email) {
      return true 
    }
  }
  return false;
}
// Take an email and userDatabase and returns the user ID for the user with the given email address
const getUserbyEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  } 
  return userUrls;
};

const cookieHasUser = function (cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  }
  return false;
}
 

module.exports = {
  generateRandomString,
  hasUserEmail,
  getUserbyEmail,
  urlsForUser,
  cookieHasUser
};
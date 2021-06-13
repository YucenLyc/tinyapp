const { assert } = require('chai');

const { generateRandomString, hasUserEmail, getUserByEmail, urlsForUser, cookieHasUser } = require('../helpers.js');

const testUsers = {
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

const testUrlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca", 
    userID: "userRandomID"
  },
  "mjqRo5": {
    longUrl: "http://www.google.com",
    userID: "user2RandomID"
  }
}
describe('generateRandomString', function() {
  it('should return a string with six characters', function() {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });

  it('should not return the same string when called multiple times', function() {
    const firstRandomString = generateRandomString();
    const secondRandomString = generateRandomString();
    assert.notEqual(firstRandomString, secondRandomString);
  });
  
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined when no user exists under a given email', function() {
    const user = getUserByEmail("lihaoxiatian@test.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
}); 

describe('urlsForUser', function () {
  it('should return an object of url(s) for a given user ID', function() {
    const specificURl = urlsForUser("user1RandomID", testUrlDatabase);
    const expectedOutput = {
      "feqypz": {
        longURL: "http://google.com",
        userID: "user1RandomID"
      }
    };
    assert.deepEqual(specificURl, expectedOutput);
  });

  it('should return an empty object if no urls exist for a given user ID', function() {
    const notspecificURl = urlsForUser("testUser", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(notspecificURl, expectedOutput);
  });
});

describe('cookieHasUser', function() {
  it('should return true if a cookie corresponds to a user in the database', function() {
    const exsitingCookie = cookieHasUser("user1RandomID", testUsers);
    const expectedOutput = true;
    assert.equal(exsitingCookie, expectedOutput);
  });

  it('should return false if a cookie does not correspond to a user in the database', function() {
    const nonExistingCookie = cookieHasUser("user22RandomID", testUsers);
    const expectedOutput = false;
    assert.equal(nonExistingCookie, expectedOutput);
  });
});
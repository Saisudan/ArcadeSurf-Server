const router = require("express").Router();
const knex = require('knex')(require('../knexfile'));
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authorize = require('../middlewares/auth');

// Get the current user's information, check if they are authorized first
router.get('/my-info', authorize, async (req, res) => {
    try {
      const user = await knex('users').where({ id: req.token.id }).first();
      // Remove the password property
      user.password = "";
      delete user.password;
      res.status(200).json(user);
      return;
    } catch (error) {
      return;
    }
});

// Check if a username is taken
router.get("/is-name-taken", async (req, res) => {
  const { username } = req.query;

  // Check if there are query parameters with data
  if (!username) {
    res.status(400).send("No username provided");
    return;
  }

  try {
    const accountExists = await knex.select("username").from("users").where('username', username).first();
    if (accountExists) {
      // Username is taken
      res.status(200).send(true);
      return;
    } else {
      // Username is available
      res.status(200).send(false);
      return;
    }

  } catch (error) {
    res.status(400).send("Failed to check availability");
    return;
  }
});

// Sign up a new user account
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if the required fields were filled
  if (!(username && password)) {
    res.status(400).send("Username and password are required to sign up a new account.");
    return;
  }

  try {
    // Check if the username is taken
    const accountExists = await knex.select("username").from("users").where('username', username).first();
    if (accountExists) {
      res.status(400).send("That username is taken.");
      return;
    }

    // Create the user's account
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      username: username,
      password: hashedPassword,
      level: 1,
      experience: 0,
      coins: 100,
      games_played: 0,
      games_hosted: 0
    };

    // Add it to the database
    await knex('users').insert(newUser);
    res.status(201).send(`Signed up ${username}!`);
    return;
  } catch (error) {
    res.status(400).send(`Failed to sign up ${username}`);
    return;
  }
});

// Login a user and return a JWT
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    res.status(400).send("Please enter the required fields");
    return;
  }

  // Find the user
  const foundUser = await knex.select('*').from('users').where('username', username).first();
  if (!foundUser) {
    res.status(400).send("Invalid username");
    return;
  }

  // Validate the password
  const validatePassword = bcrypt.compareSync(password, foundUser.password);
  if (!validatePassword) {
    res.status(400).send("Invalid password");
    return;
  }

  // Generate a token
  const token = jwt.sign(
    { id: foundUser.id, username: foundUser.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  // Send the token as a response
  res.status(200).json({ token: token });
  return;
});

module.exports = router;
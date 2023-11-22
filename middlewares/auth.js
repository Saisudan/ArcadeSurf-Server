// Authorization Middleware
const jwt = require('jsonwebtoken');

function authorize(req, res, next) {
  // Check for an auth header
  if (!req.headers.authorization) {
    res.status(401).send("Unauthenticated");
    return;
  }

  // Parse the bearer token
  const authHeader = req.headers.authorization;
  const authToken = authHeader.split(' ')[1];

  try {
    const decodedPayload = jwt.verify(authToken, process.env.JWT_SECRET);
    req.token = decodedPayload;
    next();
  } catch(error) {
    res.status(401).send("Invalid auth token");
    return;
  }
}

module.exports = authorize;
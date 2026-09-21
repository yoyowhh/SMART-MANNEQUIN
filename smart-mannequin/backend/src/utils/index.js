const jwt = require('jsonwebtoken');

exports.generateAccessToken = async (email) => {
  return jwt.sign(email, 'secrettoken', { expiresIn: '1h' });
}

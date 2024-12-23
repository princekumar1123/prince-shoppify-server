const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secretKey = 'princekumar1123';
  const options = {
    expiresIn: '12h',
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
};

module.exports = {
  generateToken
};
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 && password.length <= 32;
};

module.exports = {
  validateEmail,
  validatePassword,
};

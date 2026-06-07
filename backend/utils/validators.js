// Validation rules per challenge spec
const validateName = (name) => {
  if (!name || typeof name !== 'string') return 'Name is required';
  if (name.length < 20) return 'Name must be at least 20 characters';
  if (name.length > 60) return 'Name must be at most 60 characters';
  return null;
};

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Email is invalid';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8 || password.length > 16)
    return 'Password must be 8-16 characters';
  if (!/[A-Z]/.test(password))
    return 'Password must include at least one uppercase letter';
  if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\\\/;'`~+=]/.test(password))
    return 'Password must include at least one special character';
  return null;
};

const validateAddress = (address) => {
  if (address && address.length > 400) return 'Address must be at most 400 characters';
  return null;
};

const validateRating = (rating) => {
  const n = Number(rating);
  if (!Number.isInteger(n) || n < 1 || n > 5) return 'Rating must be an integer between 1 and 5';
  return null;
};

// Run a set of validations, return array of error messages
const runValidations = (checks) => checks.filter(Boolean);

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRating,
  runValidations,
};

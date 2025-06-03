export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.trim() !== '';
};

export const validateNumber = (value) => {
  return !isNaN(value) && value >= 0;
};
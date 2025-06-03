const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateSKU = (categoryName, productName) => {
  const categoryCode = categoryName.substring(0, 3).toUpperCase();
  const productCode = productName.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${categoryCode}-${productCode}-${timestamp}`;
};

const calculateTotalWithTax = (subtotal, taxRate = 0, discount = 0) => {
  const discountAmount = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  return afterDiscount + taxAmount;
};

const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip: Number.parseInt(skip),
    take: Number.parseInt(limit),
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateSKU,
  calculateTotalWithTax,
  paginate,
};

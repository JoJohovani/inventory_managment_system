const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");
const {
  validateRegister,
  validateLogin,
  validateUpdateUser,
} = require("../validators/userValidator");

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, validateUpdateUser, updateProfile);

module.exports = router;

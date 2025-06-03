const express = require("express")
const { register, login, getProfile, updateProfile } = require("../controllers/authController")
const { authenticate } = require("../middlewares/authMiddleware")
const { validateRegister, validateLogin, validateUpdateUser } = require("../validators/userValidator")
const { uploadUserProfile } = require("../middlewares/uploadMiddleware")

const router = express.Router()

router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/profile", authenticate, getProfile)
router.put("/profile", authenticate, uploadUserProfile, validateUpdateUser, updateProfile)

module.exports = router

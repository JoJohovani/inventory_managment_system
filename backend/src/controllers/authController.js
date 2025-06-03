const userService = require("../services/userService")
const logger = require("../utils/logger")

const register = async (req, res, next) => {
  try {
    const result = await userService.registerUser(req.body)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await userService.loginUser(email, password)

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id)

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body)

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
}

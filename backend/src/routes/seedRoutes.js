const express = require("express")
const { seedDatabase, resetDatabase, getDatabaseStatus } = require("../controllers/seedController")
const { authenticate, adminOnly } = require("../middlewares/authMiddleware")

const router = express.Router()

// Public route to check database status
router.get("/status", getDatabaseStatus)

// Protected routes (admin only)
router.use(authenticate)
router.use(adminOnly)

router.post("/seed", seedDatabase)
router.post("/reset", resetDatabase)

module.exports = router

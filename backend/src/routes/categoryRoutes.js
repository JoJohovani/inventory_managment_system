const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getAllCategories);
router.get("/stats", getCategoryStats);
router.get("/:id", getCategoryById);
router.post("/", authorize("admin", "manager"), createCategory);
router.put("/:id", authorize("admin", "manager"), updateCategory);
router.delete("/:id", authorize("admin", "manager"), deleteCategory);

module.exports = router;

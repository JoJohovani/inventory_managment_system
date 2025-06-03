const express = require("express");
const {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getTopSellingProducts,
  getDashboardStats,
} = require("../controllers/reportController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/sales", authorize("admin", "manager"), getSalesReport);
router.get("/purchases", authorize("admin", "manager"), getPurchaseReport);
router.get("/inventory", authorize("admin", "manager"), getInventoryReport);
router.get(
  "/top-products",
  authorize("admin", "manager"),
  getTopSellingProducts
);
router.get("/dashboard", getDashboardStats);

module.exports = router;

const express = require("express");
const {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchaseStatus,
  deletePurchase,
  receivePurchase,
} = require("../controllers/purchaseController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getAllPurchases);
router.get("/:id", getPurchaseById);
router.post("/", authorize("admin", "manager"), createPurchase);
router.put("/:id/status", authorize("admin", "manager"), updatePurchaseStatus);
router.put("/:id/receive", authorize("admin", "manager"), receivePurchase);
router.delete("/:id", authorize("admin", "manager"), deletePurchase);

module.exports = router;

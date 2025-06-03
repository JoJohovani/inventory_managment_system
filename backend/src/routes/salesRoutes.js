const express = require("express")
const { createSale, getAllSales, getSaleById, updateSaleStatus, deleteSale } = require("../controllers/salesController")
const { authenticate, authorize } = require("../middlewares/authMiddleware")

const router = express.Router()

router.use(authenticate)

router.get("/", getAllSales)
router.get("/:id", getSaleById)
router.post("/", authorize("admin", "manager", "cashier"), createSale)
router.put("/:id/status", authorize("admin", "manager"), updateSaleStatus)
router.delete("/:id", authorize("admin", "manager"), deleteSale)

module.exports = router

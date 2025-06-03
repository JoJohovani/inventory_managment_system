const express = require("express")
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController")
const { authenticate, authorize } = require("../middlewares/authMiddleware")
const { validateRegister, validateUpdateUser } = require("../validators/userValidator")

const router = express.Router()

router.use(authenticate)

router.get("/", getAllSuppliers)
router.get("/:id", getSupplierById)
router.post("/", authorize("admin", "manager"), validateRegister, createSupplier)
router.put("/:id", authorize("admin", "manager"), validateUpdateUser, updateSupplier)
router.delete("/:id", authorize("admin", "manager"), deleteSupplier)

module.exports = router

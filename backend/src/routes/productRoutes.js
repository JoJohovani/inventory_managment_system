const express = require("express")
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require("../controllers/productController")
const { authenticate, authorize } = require("../middlewares/authMiddleware")
const { validateCreateProduct, validateUpdateProduct } = require("../validators/productValidator")
const { uploadProductWithImages } = require("../middlewares/uploadMiddleware")

const router = express.Router()

router.use(authenticate)

router.get("/", getAllProducts)
router.get("/low-stock", getLowStockProducts)
router.get("/:id", getProductById)
router.post("/", authorize("admin", "manager"), uploadProductWithImages, validateCreateProduct, createProduct)
router.put("/:id", authorize("admin", "manager"), uploadProductWithImages, validateUpdateProduct, updateProduct)
router.delete("/:id", authorize("admin", "manager"), deleteProduct)

module.exports = router

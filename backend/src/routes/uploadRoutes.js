const express = require("express")
const { uploadSingleFile, uploadMultipleFiles, deleteFile, getFileInfo } = require("../controllers/uploadController")
const { authenticate, authorize } = require("../middlewares/authMiddleware")
const {
  uploadSingleImage,
  uploadProductImage,
  uploadProfileImage,
  uploadCategoryImage,
  uploadDocument,
  uploadMultipleImages,
  uploadProductImages,
  uploadDocuments,
  uploadAny,
  uploadMultipleAny,
} = require("../middlewares/uploadMiddleware")

const router = express.Router()

router.use(authenticate)

// Single file uploads
router.post("/image", uploadSingleImage, uploadSingleFile)
router.post("/product-image", uploadProductImage, uploadSingleFile)
router.post("/profile-image", uploadProfileImage, uploadSingleFile)
router.post("/category-image", authorize("admin", "manager"), uploadCategoryImage, uploadSingleFile)
router.post("/document", uploadDocument, uploadSingleFile)
router.post("/file", uploadAny, uploadSingleFile)

// Multiple file uploads
router.post("/images", uploadMultipleImages, uploadMultipleFiles)
router.post("/product-images", authorize("admin", "manager"), uploadProductImages, uploadMultipleFiles)
router.post("/documents", uploadDocuments, uploadMultipleFiles)
router.post("/files", uploadMultipleAny, uploadMultipleFiles)

// File management
router.delete("/:filename", authorize("admin", "manager"), deleteFile)
router.get("/:filename/info", getFileInfo)

module.exports = router

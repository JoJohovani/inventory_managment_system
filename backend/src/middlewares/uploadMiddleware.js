const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath

    // Determine upload path based on field name
    switch (file.fieldname) {
      case "profilePic":
      case "profileImage":
        uploadPath = path.join(__dirname, "../../uploads/profile_pics")
        break
      case "productImage":
      case "productImages":
        uploadPath = path.join(__dirname, "../../uploads/product_images")
        break
      case "categoryImage":
        uploadPath = path.join(__dirname, "../../uploads/category_images")
        break
      case "document":
      case "documents":
        uploadPath = path.join(__dirname, "../../uploads/documents")
        break
      case "invoice":
        uploadPath = path.join(__dirname, "../../uploads/invoices")
        break
      default:
        uploadPath = path.join(__dirname, "../../uploads/misc")
    }

    ensureDirectoryExists(uploadPath)
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, extension)
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, "_")

    cb(null, `${file.fieldname}-${sanitizedBaseName}-${uniqueSuffix}${extension}`)
  },
})

// File filters for different types
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp, svg)"))
  }
}

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt|csv|xlsx|xls/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]
  const mimetype = allowedMimeTypes.includes(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Only document files are allowed (pdf, doc, docx, txt, csv, xlsx, xls)"))
  }
}

const anyFileFilter = (req, file, cb) => {
  // Allow any file type but with size restrictions
  cb(null, true)
}

// Different upload configurations
const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5, // Maximum 5 files
  },
  fileFilter: imageFilter,
})

const documentUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
    files: 3,
  },
  fileFilter: documentFilter,
})

const anyUpload = multer({
  storage: storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: anyFileFilter,
})

// Export different upload types
module.exports = {
  // Single file uploads
  uploadSingleImage: imageUpload.single("image"),
  uploadProductImage: imageUpload.single("productImage"),
  uploadProfileImage: imageUpload.single("profileImage"),
  uploadCategoryImage: imageUpload.single("categoryImage"),
  uploadDocument: documentUpload.single("document"),
  uploadInvoice: documentUpload.single("invoice"),

  // Multiple file uploads
  uploadMultipleImages: imageUpload.array("images", 5),
  uploadProductImages: imageUpload.array("productImages", 5),
  uploadDocuments: documentUpload.array("documents", 3),

  // Mixed uploads
  uploadProductWithImages: imageUpload.fields([
    { name: "productImage", maxCount: 1 },
    { name: "productImages", maxCount: 4 },
  ]),

  uploadUserProfile: imageUpload.fields([{ name: "profileImage", maxCount: 1 }]),

  // Any file type
  uploadAny: anyUpload.single("file"),
  uploadMultipleAny: anyUpload.array("files", 10),

  // Original export for backward compatibility
  upload: imageUpload,
}

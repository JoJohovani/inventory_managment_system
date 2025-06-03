const FileHelper = require("../utils/fileHelper")
const logger = require("../utils/logger")
const path = require("path") // Import path module

const uploadSingleFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    const fileUrl = FileHelper.generateFileUrl(req.file.path.replace(__dirname + "/../../", ""))
    const fileInfo = FileHelper.getFileInfo(req.file.path)

    logger.info(`File uploaded: ${req.file.originalname}`)

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: fileInfo?.size || req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    next(error)
  }
}

const uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      })
    }

    const uploadedFiles = req.files.map((file) => {
      const fileUrl = FileHelper.generateFileUrl(file.path.replace(__dirname + "/../../", ""))
      const fileInfo = FileHelper.getFileInfo(file.path)

      return {
        filename: file.filename,
        originalName: file.originalname,
        url: fileUrl,
        size: fileInfo?.size || file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
      }
    })

    logger.info(`${req.files.length} files uploaded`)

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: uploadedFiles,
    })
  } catch (error) {
    next(error)
  }
}

const deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Filename is required",
      })
    }

    // Construct file path (you might want to add more security checks here)
    const filePath = path.join(__dirname, "../../uploads", filename)

    await FileHelper.deleteFile(filePath)

    res.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

const getFileInfo = async (req, res, next) => {
  try {
    const { filename } = req.params

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Filename is required",
      })
    }

    const filePath = path.join(__dirname, "../../uploads", filename)
    const fileInfo = FileHelper.getFileInfo(filePath)

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    res.json({
      success: true,
      data: {
        ...fileInfo,
        url: FileHelper.generateFileUrl(`uploads/${filename}`),
        sizeFormatted: FileHelper.formatFileSize(fileInfo.size),
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  getFileInfo,
}

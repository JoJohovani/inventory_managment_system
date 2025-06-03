const fs = require("fs")
const path = require("path")
const logger = require("./logger")

class FileHelper {
  /**
   * Delete a file from the filesystem
   * @param {string} filePath - Path to the file
   */
  static async deleteFile(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
        logger.info(`File deleted: ${filePath}`)
      }
    } catch (error) {
      logger.error(`Error deleting file ${filePath}:`, error)
    }
  }

  /**
   * Delete multiple files
   * @param {string[]} filePaths - Array of file paths
   */
  static async deleteFiles(filePaths) {
    const deletePromises = filePaths.map((filePath) => this.deleteFile(filePath))
    await Promise.all(deletePromises)
  }

  /**
   * Get file info
   * @param {string} filePath - Path to the file
   */
  static getFileInfo(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null
      }

      const stats = fs.statSync(filePath)
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: path.extname(filePath),
        name: path.basename(filePath),
      }
    } catch (error) {
      logger.error(`Error getting file info for ${filePath}:`, error)
      return null
    }
  }

  /**
   * Generate file URL for client access
   * @param {string} filePath - Relative file path
   */
  static generateFileUrl(filePath) {
    if (!filePath) return null

    // Remove leading slash if present
    const cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath

    // Return URL that can be accessed by client
    return `/${cleanPath}`
  }

  /**
   * Validate file type
   * @param {string} filename - File name
   * @param {string[]} allowedTypes - Array of allowed extensions
   */
  static validateFileType(filename, allowedTypes) {
    const extension = path.extname(filename).toLowerCase().substring(1)
    return allowedTypes.includes(extension)
  }

  /**
   * Get file size in human readable format
   * @param {number} bytes - File size in bytes
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  /**
   * Create directory if it doesn't exist
   * @param {string} dirPath - Directory path
   */
  static ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      logger.info(`Directory created: ${dirPath}`)
    }
  }

  /**
   * Move file from one location to another
   * @param {string} sourcePath - Source file path
   * @param {string} destinationPath - Destination file path
   */
  static async moveFile(sourcePath, destinationPath) {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath)
      this.ensureDirectoryExists(destDir)

      await fs.promises.rename(sourcePath, destinationPath)
      logger.info(`File moved from ${sourcePath} to ${destinationPath}`)
      return true
    } catch (error) {
      logger.error(`Error moving file from ${sourcePath} to ${destinationPath}:`, error)
      return false
    }
  }

  /**
   * Copy file from one location to another
   * @param {string} sourcePath - Source file path
   * @param {string} destinationPath - Destination file path
   */
  static async copyFile(sourcePath, destinationPath) {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath)
      this.ensureDirectoryExists(destDir)

      await fs.promises.copyFile(sourcePath, destinationPath)
      logger.info(`File copied from ${sourcePath} to ${destinationPath}`)
      return true
    } catch (error) {
      logger.error(`Error copying file from ${sourcePath} to ${destinationPath}:`, error)
      return false
    }
  }
}

module.exports = FileHelper

const productRepository = require("../repositories/productRepository")
const categoryRepository = require("../repositories/categoryRepository")
const { generateSKU } = require("../utils/helpers")
const FileHelper = require("../utils/fileHelper")
const logger = require("../utils/logger")
const path = require("path")

class ProductService {
  async createProduct(productData, imagePaths = []) {
    const { name, description, sku, barcode, price, cost, quantity, minStock, maxStock, categoryId } = productData

    // Check if category exists
    const category = await categoryRepository.findUnique({ id: categoryId, isDeleted: false })
    if (!category) {
      throw new Error("Category not found")
    }

    // Generate SKU if not provided
    const productSKU = sku || generateSKU(category.name, name)

    // Check for duplicate SKU
    if (productSKU) {
      const existingSKU = await productRepository.findBySku(productSKU)
      if (existingSKU) {
        throw new Error("Product with this SKU already exists")
      }
    }

    // Check for duplicate barcode
    if (barcode) {
      const existingBarcode = await productRepository.findByBarcode(barcode)
      if (existingBarcode) {
        throw new Error("Product with this barcode already exists")
      }
    }

    // Handle images - store as JSON array or comma-separated string
    const imageData = imagePaths.length > 0 ? JSON.stringify(imagePaths) : null

    const product = await productRepository.create(
      {
        name,
        description,
        sku: productSKU,
        barcode,
        price,
        cost,
        quantity: quantity || 0,
        minStock,
        maxStock,
        image: imageData, // Store multiple images as JSON
        categoryId,
      },
      {
        category: true,
      },
    )

    logger.info(`Product created: ${name} (ID: ${product.id})`)
    return {
      ...product,
      images: imagePaths, // Return parsed images for response
    }
  }

  async updateProduct(productId, updateData, imagePaths = []) {
    // Check if product exists
    const existingProduct = await productRepository.findUnique({ id: productId, isDeleted: false })
    if (!existingProduct) {
      throw new Error("Product not found")
    }

    // Check for duplicate SKU (if updating SKU)
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const existingSKU = await productRepository.findBySku(updateData.sku)
      if (existingSKU) {
        throw new Error("Product with this SKU already exists")
      }
    }

    // Check for duplicate barcode (if updating barcode)
    if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
      const existingBarcode = await productRepository.findByBarcode(updateData.barcode)
      if (existingBarcode) {
        throw new Error("Product with this barcode already exists")
      }
    }

    // Handle image updates
    if (imagePaths.length > 0) {
      // Delete old images if replacing
      if (existingProduct.image) {
        try {
          const oldImages = JSON.parse(existingProduct.image)
          if (Array.isArray(oldImages)) {
            for (const oldImagePath of oldImages) {
              const fullPath = path.join(__dirname, "../..", oldImagePath)
              await FileHelper.deleteFile(fullPath)
            }
          }
        } catch (error) {
          logger.warn("Error deleting old product images:", error)
        }
      }

      updateData.image = JSON.stringify(imagePaths)
    }

    const product = await productRepository.update({ id: productId }, updateData, {
      category: true,
    })

    logger.info(`Product updated: ${product.name} (ID: ${product.id})`)

    // Parse images for response
    let images = []
    if (product.image) {
      try {
        images = JSON.parse(product.image)
      } catch (error) {
        images = [product.image] // Fallback for single image
      }
    }

    return {
      ...product,
      images,
    }
  }

  // ... rest of the service methods remain the same
  async getAllProducts(page = 1, limit = 10, filters = {}) {
    const result = await productRepository.findActiveProducts(page, limit, filters)

    // Parse images for all products
    result.data = result.data.map((product) => {
      let images = []
      if (product.image) {
        try {
          images = JSON.parse(product.image)
        } catch (error) {
          images = [product.image] // Fallback for single image
        }
      }
      return {
        ...product,
        images,
      }
    })

    return result
  }

  async getProductById(productId) {
    const product = await productRepository.findWithSalesHistory(productId)
    if (!product) {
      throw new Error("Product not found")
    }

    // Parse images
    let images = []
    if (product.image) {
      try {
        images = JSON.parse(product.image)
      } catch (error) {
        images = [product.image] // Fallback for single image
      }
    }

    return {
      ...product,
      images,
    }
  }

  async deleteProduct(productId) {
    const product = await productRepository.findUnique({ id: productId, isDeleted: false })
    if (!product) {
      throw new Error("Product not found")
    }

    // Delete associated images
    if (product.image) {
      try {
        const images = JSON.parse(product.image)
        if (Array.isArray(images)) {
          for (const imagePath of images) {
            const fullPath = path.join(__dirname, "../..", imagePath)
            await FileHelper.deleteFile(fullPath)
          }
        }
      } catch (error) {
        logger.warn("Error deleting product images:", error)
      }
    }

    await productRepository.softDelete({ id: productId })
    logger.info(`Product deleted: ${product.name} (ID: ${product.id})`)
  }

  async getLowStockProducts() {
    // Get threshold from settings or use default
    const settings = await this.getSettings()
    const threshold = settings?.lowStockThreshold || 5

    const result = await productRepository.findLowStockProducts(threshold)

    // Parse images for all products
    const products = result.map((product) => {
      let images = []
      if (product.image) {
        try {
          images = JSON.parse(product.image)
        } catch (error) {
          images = [product.image] // Fallback for single image
        }
      }
      return {
        ...product,
        images,
      }
    })

    return {
      products,
      threshold,
    }
  }

  async getProductsByCategory(categoryId) {
    const result = await productRepository.findByCategory(categoryId)

    // Parse images for all products
    return result.map((product) => {
      let images = []
      if (product.image) {
        try {
          images = JSON.parse(product.image)
        } catch (error) {
          images = [product.image] // Fallback for single image
        }
      }
      return {
        ...product,
        images,
      }
    })
  }

  async updateProductStock(productId, quantity) {
    const product = await productRepository.findUnique({ id: productId, isDeleted: false })
    if (!product) {
      throw new Error("Product not found")
    }

    return await productRepository.updateStock(productId, quantity)
  }

  async adjustProductStock(productId, adjustment, type = "increment") {
    const product = await productRepository.findUnique({ id: productId, isDeleted: false })
    if (!product) {
      throw new Error("Product not found")
    }

    if (type === "increment") {
      return await productRepository.incrementStock(productId, adjustment)
    } else {
      // Check if we have enough stock for decrement
      if (product.quantity < adjustment) {
        throw new Error("Insufficient stock")
      }
      return await productRepository.decrementStock(productId, adjustment)
    }
  }

  // Helper method to get settings
  async getSettings() {
    const { prisma } = require("../config/db")
    return await prisma.settings.findUnique({ where: { id: 1 } })
  }
}

module.exports = new ProductService()

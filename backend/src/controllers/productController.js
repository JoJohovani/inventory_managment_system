const productService = require("../services/productService")

const createProduct = async (req, res, next) => {
  try {
    let imagePaths = []

    // Handle single image
    if (req.file) {
      imagePaths.push(`/uploads/product_images/${req.file.filename}`)
    }

    // Handle multiple images
    if (req.files) {
      if (req.files.productImage) {
        imagePaths.push(`/uploads/product_images/${req.files.productImage[0].filename}`)
      }
      if (req.files.productImages) {
        const additionalImages = req.files.productImages.map((file) => `/uploads/product_images/${file.filename}`)
        imagePaths = [...imagePaths, ...additionalImages]
      }
    }

    const product = await productService.createProduct(req.body, imagePaths)

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, categoryId, lowStock } = req.query
    const filters = { search, categoryId, lowStock }

    const result = await productService.getAllProducts(page, limit, filters)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await productService.getProductById(Number.parseInt(id))

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    let imagePaths = []

    // Handle single image
    if (req.file) {
      imagePaths.push(`/uploads/product_images/${req.file.filename}`)
    }

    // Handle multiple images
    if (req.files) {
      if (req.files.productImage) {
        imagePaths.push(`/uploads/product_images/${req.files.productImage[0].filename}`)
      }
      if (req.files.productImages) {
        const additionalImages = req.files.productImages.map((file) => `/uploads/product_images/${file.filename}`)
        imagePaths = [...imagePaths, ...additionalImages]
      }
    }

    const product = await productService.updateProduct(Number.parseInt(id), req.body, imagePaths)

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    await productService.deleteProduct(Number.parseInt(id))

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

const getLowStockProducts = async (req, res, next) => {
  try {
    const result = await productService.getLowStockProducts()

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
}

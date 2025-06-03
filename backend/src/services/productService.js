const productRepository = require("../repositories/productRepository");
const categoryRepository = require("../repositories/categoryRepository");
const { generateSKU } = require("../utils/helpers");
const logger = require("../utils/logger");

class ProductService {
  async createProduct(productData, imagePath = null) {
    const {
      name,
      description,
      sku,
      barcode,
      price,
      cost,
      quantity,
      minStock,
      maxStock,
      categoryId,
    } = productData;

    // Check if category exists
    const category = await categoryRepository.findUnique({
      id: categoryId,
      isDeleted: false,
    });
    if (!category) {
      throw new Error("Category not found");
    }

    // Generate SKU if not provided
    const productSKU = sku || generateSKU(category.name, name);

    // Check for duplicate SKU
    if (productSKU) {
      const existingSKU = await productRepository.findBySku(productSKU);
      if (existingSKU) {
        throw new Error("Product with this SKU already exists");
      }
    }

    // Check for duplicate barcode
    if (barcode) {
      const existingBarcode = await productRepository.findByBarcode(barcode);
      if (existingBarcode) {
        throw new Error("Product with this barcode already exists");
      }
    }

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
        image: imagePath,
        categoryId,
      },
      {
        category: true,
      }
    );

    logger.info(`Product created: ${name} (ID: ${product.id})`);
    return product;
  }

  async getAllProducts(page = 1, limit = 10, filters = {}) {
    return await productRepository.findActiveProducts(page, limit, filters);
  }

  async getProductById(productId) {
    const product = await productRepository.findWithSalesHistory(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async updateProduct(productId, updateData, imagePath = null) {
    // Check if product exists
    const existingProduct = await productRepository.findUnique({
      id: productId,
      isDeleted: false,
    });
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Check for duplicate SKU (if updating SKU)
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const existingSKU = await productRepository.findBySku(updateData.sku);
      if (existingSKU) {
        throw new Error("Product with this SKU already exists");
      }
    }

    // Check for duplicate barcode (if updating barcode)
    if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
      const existingBarcode = await productRepository.findByBarcode(
        updateData.barcode
      );
      if (existingBarcode) {
        throw new Error("Product with this barcode already exists");
      }
    }

    // Add image path if provided
    if (imagePath) {
      updateData.image = imagePath;
    }

    const product = await productRepository.update(
      { id: productId },
      updateData,
      {
        category: true,
      }
    );

    logger.info(`Product updated: ${product.name} (ID: ${product.id})`);
    return product;
  }

  async deleteProduct(productId) {
    const product = await productRepository.findUnique({
      id: productId,
      isDeleted: false,
    });
    if (!product) {
      throw new Error("Product not found");
    }

    await productRepository.softDelete({ id: productId });
    logger.info(`Product deleted: ${product.name} (ID: ${product.id})`);
  }

  async getLowStockProducts() {
    // Get threshold from settings or use default
    const settings = await this.getSettings();
    const threshold = settings?.lowStockThreshold || 5;

    const products = await productRepository.findLowStockProducts(threshold);
    return {
      products,
      threshold,
    };
  }

  async getProductsByCategory(categoryId) {
    return await productRepository.findByCategory(categoryId);
  }

  async updateProductStock(productId, quantity) {
    const product = await productRepository.findUnique({
      id: productId,
      isDeleted: false,
    });
    if (!product) {
      throw new Error("Product not found");
    }

    return await productRepository.updateStock(productId, quantity);
  }

  async adjustProductStock(productId, adjustment, type = "increment") {
    const product = await productRepository.findUnique({
      id: productId,
      isDeleted: false,
    });
    if (!product) {
      throw new Error("Product not found");
    }

    if (type === "increment") {
      return await productRepository.incrementStock(productId, adjustment);
    } else {
      // Check if we have enough stock for decrement
      if (product.quantity < adjustment) {
        throw new Error("Insufficient stock");
      }
      return await productRepository.decrementStock(productId, adjustment);
    }
  }

  // Helper method to get settings
  async getSettings() {
    const { prisma } = require("../config/db");
    return await prisma.settings.findUnique({ where: { id: 1 } });
  }
}

module.exports = new ProductService();

const purchaseRepository = require("../repositories/purchaseRepository")
const productRepository = require("../repositories/productRepository")
const { calculateTotalWithTax } = require("../utils/helpers")
const logger = require("../utils/logger")

class PurchaseService {
  async createPurchase(purchaseData, userId) {
    const { supplierId, products, discount = 0, tax = 0, status = "received", notes } = purchaseData

    // Validate products and calculate total
    let subtotal = 0
    const productPurchases = []

    for (const item of products) {
      const product = await productRepository.findUnique({ id: item.productId, isDeleted: false })

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`)
      }

      const itemTotal = item.price * item.quantity
      subtotal += itemTotal

      productPurchases.push({
        productId: item.productId,
        purchase_quantity: item.quantity,
        purchase_price: item.price,
      })
    }

    const totalCost = calculateTotalWithTax(subtotal, tax, discount)

    // Create purchase with transaction
    const purchase = await purchaseRepository.createPurchaseWithProducts(
      {
        userId,
        supplierId,
        totalCost,
        discount,
        tax,
        status,
        notes,
      },
      productPurchases,
    )

    // Update product quantities and costs if status is "received"
    if (status === "received") {
      for (const item of products) {
        await productRepository.incrementStock(item.productId, item.quantity)

        // Update product cost if provided
        if (item.price) {
          await productRepository.update({ id: item.productId }, { cost: item.price })
        }
      }
    }

    // Fetch complete purchase data
    const completePurchase = await purchaseRepository.findPurchaseWithDetails(purchase.id)

    logger.info(`Purchase created: ID ${purchase.id}, Total: ${totalCost}`)
    return completePurchase
  }

  async getAllPurchases(page = 1, limit = 10, filters = {}) {
    return await purchaseRepository.findPurchasesWithDetails(page, limit, filters)
  }

  async getPurchaseById(purchaseId) {
    const purchase = await purchaseRepository.findPurchaseWithDetails(purchaseId)
    if (!purchase) {
      throw new Error("Purchase not found")
    }
    return purchase
  }

  async updatePurchaseStatus(purchaseId, status) {
    const purchase = await purchaseRepository.findPurchaseWithDetails(purchaseId)
    if (!purchase) {
      throw new Error("Purchase not found")
    }

    const oldStatus = purchase.status

    // Update purchase status
    const updatedPurchase = await purchaseRepository.update(
      { id: purchaseId },
      { status },
      {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        supplier: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    )

    // If status changed from pending to received, update inventory
    if (oldStatus !== "received" && status === "received") {
      for (const productPurchase of purchase.productPurchases) {
        await productRepository.incrementStock(productPurchase.productId, productPurchase.purchase_quantity)

        // Update product cost
        await productRepository.update({ id: productPurchase.productId }, { cost: productPurchase.purchase_price })
      }
    }

    // If status changed from received to pending/cancelled, reduce inventory
    if (oldStatus === "received" && status !== "received") {
      for (const productPurchase of purchase.productPurchases) {
        await productRepository.decrementStock(productPurchase.productId, productPurchase.purchase_quantity)
      }
    }

    logger.info(`Purchase status updated: ID ${purchaseId}, Status: ${status}`)
    return updatedPurchase
  }

  async deletePurchase(purchaseId) {
    const purchase = await purchaseRepository.findPurchaseWithDetails(purchaseId)
    if (!purchase) {
      throw new Error("Purchase not found")
    }

    // If purchase was received, reduce inventory
    if (purchase.status === "received") {
      for (const productPurchase of purchase.productPurchases) {
        await productRepository.decrementStock(productPurchase.productId, productPurchase.purchase_quantity)
      }
    }

    // Soft delete purchase
    await purchaseRepository.softDelete({ id: purchaseId })

    logger.info(`Purchase deleted: ID ${purchaseId}`)
  }

  async getPurchaseReport(startDate, endDate) {
    return await purchaseRepository.getPurchaseReport(startDate, endDate)
  }

  async getPurchasesByUser(userId, page = 1, limit = 10) {
    return await purchaseRepository.findPurchasesWithDetails(page, limit, { userId })
  }

  async getPurchasesBySupplier(supplierId, page = 1, limit = 10) {
    return await purchaseRepository.findPurchasesWithDetails(page, limit, { supplierId })
  }

  async receivePurchase(purchaseId) {
    return await this.updatePurchaseStatus(purchaseId, "received")
  }

  async cancelPurchase(purchaseId) {
    return await this.updatePurchaseStatus(purchaseId, "cancelled")
  }
}

module.exports = new PurchaseService()

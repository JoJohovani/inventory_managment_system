const saleRepository = require("../repositories/saleRepository")
const productRepository = require("../repositories/productRepository")
const { calculateTotalWithTax } = require("../utils/helpers")
const logger = require("../utils/logger")

class SaleService {
  async createSale(saleData, userId) {
    const { customerId, products, discount = 0, tax = 0, paymentMethod, notes } = saleData

    // Validate products and calculate total
    let subtotal = 0
    const productUpdates = []
    const productSales = []

    for (const item of products) {
      const product = await productRepository.findUnique({ id: item.productId, isDeleted: false })

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`)
      }

      if (product.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
        )
      }

      const itemTotal = item.price * item.quantity
      subtotal += itemTotal

      productUpdates.push({
        productId: item.productId,
        newQuantity: product.quantity - item.quantity,
      })

      productSales.push({
        productId: item.productId,
        sale_quantity: item.quantity,
        sale_price: item.price,
      })
    }

    const totalPrice = calculateTotalWithTax(subtotal, tax, discount)

    // Create sale with transaction
    const sale = await saleRepository.createSaleWithProducts(
      {
        userId,
        customerId,
        totalPrice,
        discount,
        tax,
        paymentMethod,
        notes,
      },
      productSales,
    )

    // Update product quantities
    for (const update of productUpdates) {
      await productRepository.updateStock(update.productId, update.newQuantity)
    }

    // Fetch complete sale data
    const completeSale = await saleRepository.findSaleWithDetails(sale.id)

    logger.info(`Sale created: ID ${sale.id}, Total: ${totalPrice}`)
    return completeSale
  }

  async getAllSales(page = 1, limit = 10, filters = {}) {
    return await saleRepository.findSalesWithDetails(page, limit, filters)
  }

  async getSaleById(saleId) {
    const sale = await saleRepository.findSaleWithDetails(saleId)
    if (!sale) {
      throw new Error("Sale not found")
    }
    return sale
  }

  async updateSaleStatus(saleId, status) {
    const sale = await saleRepository.findUnique({ id: saleId, isDeleted: false })
    if (!sale) {
      throw new Error("Sale not found")
    }

    const updatedSale = await saleRepository.update(
      { id: saleId },
      { status },
      {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    )

    logger.info(`Sale status updated: ID ${saleId}, Status: ${status}`)
    return updatedSale
  }

  async deleteSale(saleId) {
    const sale = await saleRepository.findSaleWithDetails(saleId)
    if (!sale) {
      throw new Error("Sale not found")
    }

    // Restore inventory using transaction
    const { prisma } = require("../config/db")
    await prisma.$transaction(async (tx) => {
      // Restore product quantities
      for (const productSale of sale.productSales) {
        await tx.product.update({
          where: { id: productSale.productId },
          data: {
            quantity: {
              increment: productSale.sale_quantity,
            },
          },
        })
      }

      // Soft delete sale
      await tx.sale.update({
        where: { id: saleId },
        data: { isDeleted: true },
      })
    })

    logger.info(`Sale deleted: ID ${saleId}`)
  }

  async getSalesReport(startDate, endDate) {
    return await saleRepository.getSalesReport(startDate, endDate)
  }

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    return await saleRepository.getTopSellingProducts(startDate, endDate, limit)
  }

  async getSalesByUser(userId, page = 1, limit = 10) {
    return await saleRepository.findSalesWithDetails(page, limit, { userId })
  }

  async getSalesByCustomer(customerId, page = 1, limit = 10) {
    return await saleRepository.findSalesWithDetails(page, limit, { customerId })
  }

  async getDailySales(date) {
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    return await saleRepository.getSalesReport(startDate, endDate)
  }
}

module.exports = new SaleService()

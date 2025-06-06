const express = require("express")
const { authenticate, authorize } = require("../middlewares/authMiddleware")
const { prisma } = require("../config/db")
const logger = require("../utils/logger")

const router = express.Router()

router.use(authenticate)

// Get all sales orders
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query
    const skip = (page - 1) * limit
    const take = parseInt(limit)

    const where = {
      isDeleted: false,
      ...(status && { status }),
      ...(customerId && { customerId: parseInt(customerId) })
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          user: {
            select: { id: true, firstName: true, lastName: true }
          },
          productSales: {
            include: {
              product: {
                select: { id: true, name: true, price: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.sale.count({ where })
    ])

    const formattedSales = sales.map(sale => ({
      id: sale.id,
      customer_id: sale.customerId,
      customer_name: sale.customer ? 
        `${sale.customer.firstName} ${sale.customer.lastName}` : 
        "Walk-in Customer",
      total_amount: sale.totalPrice,
      status: sale.status,
      created_at: sale.createdAt,
      items: sale.productSales.map(ps => ({
        product: ps.product,
        quantity: ps.sale_quantity,
        price: ps.sale_price
      }))
    }))

    res.json({
      success: true,
      data: formattedSales,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

// Create new sales order
router.post("/", async (req, res, next) => {
  try {
    const { customer_id, items, status = "completed" } = req.body
    const userId = req.user.id

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required"
      })
    }

    // Calculate total and validate stock
    let totalAmount = 0
    const productUpdates = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.product_id, isDeleted: false }
      })

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product_id} not found`
        })
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
        })
      }

      totalAmount += item.price * item.quantity
      productUpdates.push({
        productId: item.product_id,
        newQuantity: product.quantity - item.quantity
      })
    }

    // Create sale with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create sale
      const sale = await tx.sale.create({
        data: {
          userId,
          customerId: customer_id || null,
          totalPrice: totalAmount,
          status,
          paymentMethod: "cash"
        }
      })

      // Create product sales
      for (const item of items) {
        await tx.productSale.create({
          data: {
            saleId: sale.id,
            productId: item.product_id,
            sale_quantity: item.quantity,
            sale_price: item.price
          }
        })
      }

      // Update product quantities
      for (const update of productUpdates) {
        await tx.product.update({
          where: { id: update.productId },
          data: { quantity: update.newQuantity }
        })
      }

      return sale
    })

    logger.info(`Sale created: ID ${result.id}, Total: ${totalAmount}`)

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// Update sale status
router.put("/:id/status", authorize("admin", "manager"), async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const sale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    res.json({
      success: true,
      message: "Sale status updated successfully",
      data: sale
    })
  } catch (error) {
    next(error)
  }
})

// Get sale by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id), isDeleted: false },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        user: {
          select: { id: true, firstName: true, lastName: true }
        },
        productSales: {
          include: {
            product: true
          }
        }
      }
    })

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found"
      })
    }

    res.json({
      success: true,
      data: sale
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
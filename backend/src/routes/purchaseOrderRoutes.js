const express = require("express")
const { authenticate, authorize } = require("../middlewares/authMiddleware")
const { prisma } = require("../config/db")
const logger = require("../utils/logger")

const router = express.Router()

router.use(authenticate)

// Get all purchase orders
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, supplierId } = req.query
    const skip = (page - 1) * limit
    const take = parseInt(limit)

    const where = {
      isDeleted: false,
      ...(status && { status }),
      ...(supplierId && { supplierId: parseInt(supplierId) })
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          supplier: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          user: {
            select: { id: true, firstName: true, lastName: true }
          },
          productPurchases: {
            include: {
              product: {
                select: { id: true, name: true, cost: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.purchase.count({ where })
    ])

    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      supplier_id: purchase.supplierId,
      supplier_name: purchase.supplier ? 
        `${purchase.supplier.firstName} ${purchase.supplier.lastName}` : 
        "Unknown Supplier",
      total_amount: purchase.totalCost,
      status: purchase.status,
      created_at: purchase.createdAt,
      items: purchase.productPurchases.map(pp => ({
        product: pp.product,
        quantity: pp.purchase_quantity,
        price: pp.purchase_price
      }))
    }))

    res.json({
      success: true,
      data: formattedPurchases,
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

// Create new purchase order
router.post("/", authorize("admin", "manager"), async (req, res, next) => {
  try {
    const { supplier_id, items } = req.body
    const userId = req.user.id

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required"
      })
    }

    // Calculate total
    let totalCost = 0
    for (const item of items) {
      totalCost += parseFloat(item.price) * parseInt(item.quantity)
    }

    // Create purchase with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create purchase
      const purchase = await tx.purchase.create({
        data: {
          userId,
          supplierId: parseInt(supplier_id),
          totalCost,
          status: "pending"
        }
      })

      // Create product purchases
      for (const item of items) {
        await tx.productPurchase.create({
          data: {
            purchaseId: purchase.id,
            productId: item.product_id,
            purchase_quantity: parseInt(item.quantity),
            purchase_price: parseFloat(item.price)
          }
        })
      }

      return purchase
    })

    logger.info(`Purchase order created: ID ${result.id}, Total: ${totalCost}`)

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// Update purchase status
router.put("/:id/status", authorize("admin", "manager"), async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: {
        productPurchases: true
      }
    })

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found"
      })
    }

    // Update purchase status and inventory if completed
    const result = await prisma.$transaction(async (tx) => {
      const updatedPurchase = await tx.purchase.update({
        where: { id: parseInt(id) },
        data: { status }
      })

      // If status is completed, update inventory
      if (status === "completed" && purchase.status !== "completed") {
        for (const pp of purchase.productPurchases) {
          await tx.product.update({
            where: { id: pp.productId },
            data: {
              quantity: { increment: pp.purchase_quantity },
              cost: pp.purchase_price
            }
          })
        }
      }

      return updatedPurchase
    })

    res.json({
      success: true,
      message: "Purchase status updated successfully",
      data: result
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
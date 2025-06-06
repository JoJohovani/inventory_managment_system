const express = require("express")
const { authenticate } = require("../middlewares/authMiddleware")
const { prisma } = require("../config/db")

const router = express.Router()

router.use(authenticate)

// Dashboard stats endpoint
router.get("/stats", async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalSales,
      totalCustomers,
      totalSuppliers,
      lowStockProducts,
      totalRevenue
    ] = await Promise.all([
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.sale.count({ where: { isDeleted: false } }),
      prisma.user.count({ 
        where: { 
          isDeleted: false,
          role: { role_type: "customer" }
        }
      }),
      prisma.user.count({ 
        where: { 
          isDeleted: false,
          role: { role_type: "supplier" }
        }
      }),
      prisma.product.findMany({
        where: {
          isDeleted: false,
          quantity: { lte: 10 }
        },
        include: { category: true }
      }),
      prisma.sale.aggregate({
        where: { isDeleted: false },
        _sum: { totalPrice: true }
      })
    ])

    res.json({
      success: true,
      data: {
        totalProducts,
        totalSales,
        totalCustomers,
        totalSuppliers,
        lowStockItems: lowStockProducts,
        totalRevenue: totalRevenue._sum.totalPrice || 0
      }
    })
  } catch (error) {
    next(error)
  }
})

// Dashboard activities endpoint
router.get("/activities", async (req, res, next) => {
  try {
    const recentSales = await prisma.sale.findMany({
      where: { isDeleted: false },
      include: {
        customer: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    const recentPurchases = await prisma.purchase.findMany({
      where: { isDeleted: false },
      include: {
        supplier: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    const activities = [
      ...recentSales.map(sale => ({
        id: sale.id,
        type: "sale",
        amount: sale.totalPrice,
        date: sale.createdAt,
        relatedEntity: {
          name: sale.customer ? 
            `${sale.customer.firstName} ${sale.customer.lastName}` : 
            "Walk-in Customer"
        }
      })),
      ...recentPurchases.map(purchase => ({
        id: purchase.id,
        type: "purchase",
        amount: purchase.totalCost,
        date: purchase.createdAt,
        relatedEntity: {
          name: purchase.supplier ? 
            `${purchase.supplier.firstName} ${purchase.supplier.lastName}` : 
            "Unknown Supplier"
        }
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

    res.json({
      success: true,
      data: activities
    })
  } catch (error) {
    next(error)
  }
})

// Revenue data for charts
router.get("/revenue-data", async (req, res, next) => {
  try {
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        SUM(totalPrice) as revenue
      FROM Sale 
      WHERE isDeleted = false 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `

    res.json({
      success: true,
      data: revenueData
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
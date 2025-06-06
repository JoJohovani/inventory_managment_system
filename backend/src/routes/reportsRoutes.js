const express = require("express")
const { authenticate, authorize } = require("../middlewares/authMiddleware")
const { prisma } = require("../config/db")

const router = express.Router()

router.use(authenticate)

// Inventory report
router.get("/inventory", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    const formattedProducts = products.map(product => ({
      name: product.name,
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity,
      price: product.price
    }))

    res.json(formattedProducts)
  } catch (error) {
    next(error)
  }
})

// Monthly revenue report
router.get("/monthly-revenue", async (req, res, next) => {
  try {
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        SUM(totalPrice) as total
      FROM Sale 
      WHERE isDeleted = false 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `

    res.json(revenueData)
  } catch (error) {
    next(error)
  }
})

// Top products report
router.get("/top-products", async (req, res, next) => {
  try {
    const topProducts = await prisma.$queryRaw`
      SELECT 
        p.name as product_name,
        SUM(ps.sale_quantity) as total_sold
      FROM ProductSale ps
      JOIN Product p ON ps.productId = p.id
      JOIN Sale s ON ps.saleId = s.id
      WHERE ps.isDeleted = false 
        AND s.isDeleted = false
        AND p.isDeleted = false
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `

    res.json(topProducts)
  } catch (error) {
    next(error)
  }
})

// Low stock report
router.get("/low-stock", async (req, res, next) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        quantity: { lte: 10 }
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    const formattedProducts = lowStockProducts.map(product => ({
      name: product.name,
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity
    }))

    res.json(formattedProducts)
  } catch (error) {
    next(error)
  }
})

// Purchases report
router.get("/purchases", async (req, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { isDeleted: false },
      include: {
        supplier: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      supplier_name: purchase.supplier ? 
        `${purchase.supplier.firstName} ${purchase.supplier.lastName}` : 
        "Unknown Supplier",
      total_amount: purchase.totalCost,
      status: purchase.status,
      created_at: purchase.createdAt
    }))

    res.json(formattedPurchases)
  } catch (error) {
    next(error)
  }
})

// Inventory valuation report
router.get("/inventory-value", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    const formattedProducts = products.map(product => ({
      name: product.name,
      category_name: product.category?.name || "Uncategorized",
      quantity: product.quantity,
      price: product.price,
      total_value: product.quantity * product.price
    }))

    res.json(formattedProducts)
  } catch (error) {
    next(error)
  }
})

// Supplier analysis report
router.get("/supplier-analysis", async (req, res, next) => {
  try {
    const supplierData = await prisma.$queryRaw`
      SELECT 
        CONCAT(u.firstName, ' ', u.lastName) as supplier_name,
        COUNT(p.id) as total_orders,
        SUM(p.totalCost) as total_spent
      FROM Purchase p
      JOIN User u ON p.supplierId = u.id
      WHERE p.isDeleted = false
      GROUP BY p.supplierId, u.firstName, u.lastName
      ORDER BY total_spent DESC
    `

    res.json(supplierData)
  } catch (error) {
    next(error)
  }
})

// Cost analysis report
router.get("/cost-analysis", async (req, res, next) => {
  try {
    const costData = await prisma.$queryRaw`
      SELECT 
        p.name as product_name,
        SUM(pp.purchase_quantity) as total_purchased,
        SUM(pp.purchase_price * pp.purchase_quantity) as total_cost
      FROM ProductPurchase pp
      JOIN Product p ON pp.productId = p.id
      JOIN Purchase pur ON pp.purchaseId = pur.id
      WHERE pp.isDeleted = false 
        AND pur.isDeleted = false
        AND p.isDeleted = false
      GROUP BY p.id, p.name
      ORDER BY total_cost DESC
    `

    res.json(costData)
  } catch (error) {
    next(error)
  }
})

module.exports = router
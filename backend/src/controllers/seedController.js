const { exec } = require("child_process")
const logger = require("../utils/logger")

const seedDatabase = async (req, res, next) => {
  try {
    logger.info("Starting database seeding...")

    exec("npm run prisma:seed", (error, stdout, stderr) => {
      if (error) {
        logger.error("Seeding error:", error)
        return res.status(500).json({
          success: false,
          message: "Database seeding failed",
          error: error.message,
        })
      }

      if (stderr) {
        logger.warn("Seeding warnings:", stderr)
      }

      logger.info("Database seeding completed:", stdout)

      res.json({
        success: true,
        message: "Database seeded successfully",
        output: stdout,
      })
    })
  } catch (error) {
    next(error)
  }
}

const resetDatabase = async (req, res, next) => {
  try {
    logger.info("Starting database reset...")

    exec("npm run db:reset", (error, stdout, stderr) => {
      if (error) {
        logger.error("Reset error:", error)
        return res.status(500).json({
          success: false,
          message: "Database reset failed",
          error: error.message,
        })
      }

      if (stderr) {
        logger.warn("Reset warnings:", stderr)
      }

      logger.info("Database reset completed:", stdout)

      res.json({
        success: true,
        message: "Database reset and seeded successfully",
        output: stdout,
      })
    })
  } catch (error) {
    next(error)
  }
}

const getDatabaseStatus = async (req, res, next) => {
  try {
    const { prisma } = require("../config/db")

    // Get counts of all entities
    const [userCount, roleCount, categoryCount, productCount, saleCount, purchaseCount] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.sale.count(),
      prisma.purchase.count(),
    ])

    const isEmpty = userCount === 0 && roleCount === 0 && categoryCount === 0

    res.json({
      success: true,
      data: {
        isEmpty,
        counts: {
          users: userCount,
          roles: roleCount,
          categories: categoryCount,
          products: productCount,
          sales: saleCount,
          purchases: purchaseCount,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  seedDatabase,
  resetDatabase,
  getDatabaseStatus,
}

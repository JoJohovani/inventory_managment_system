const { prisma } = require("./config/db")
const logger = require("./utils/logger")

const healthCheck = async () => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: "connected",
    }

    return health
  } catch (error) {
    logger.error("Health check failed:", error)

    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: "disconnected",
      error: error.message,
    }
  }
}

module.exports = healthCheck

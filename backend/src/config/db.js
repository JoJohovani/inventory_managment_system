const { PrismaClient } = require("@prisma/client")
const logger = require("../utils/logger")

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
})

// Log database queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    logger.info(`Query: ${e.query}`)
    logger.info(`Duration: ${e.duration}ms`)
  })
}

prisma.$on("error", (e) => {
  logger.error("Database error:", e)
})

// Test database connection
const connectDB = async () => {
  try {
    await prisma.$connect()
    logger.info("Database connected successfully")
  } catch (error) {
    logger.error("Database connection failed:", error)
    process.exit(1)
  }
}

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await prisma.$disconnect()
    logger.info("Database disconnected successfully")
  } catch (error) {
    logger.error("Error disconnecting from database:", error)
  }
}

module.exports = { prisma, connectDB, disconnectDB }

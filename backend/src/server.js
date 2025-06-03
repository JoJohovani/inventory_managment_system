require("dotenv").config()
const app = require("./app")
const { connectDB, disconnectDB } = require("./config/db")
const logger = require("./utils/logger")

const PORT = process.env.PORT || 5000

// Connect to database
connectDB()

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`)

  server.close(async () => {
    logger.info("HTTP server closed")

    try {
      await disconnectDB()
      logger.info("Database disconnected")
      process.exit(0)
    } catch (error) {
      logger.error("Error during shutdown:", error)
      process.exit(1)
    }
  })

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down")
    process.exit(1)
  }, 30000)
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

module.exports = server

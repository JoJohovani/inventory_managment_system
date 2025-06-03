const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
const path = require("path")

const { errorHandler, notFound } = require("./middlewares/errorHandler")
const logger = require("./utils/logger")

// Import routes
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const salesRoutes = require("./routes/salesRoutes")
const userRoutes = require("./routes/userRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const purchaseRoutes = require("./routes/purchaseRoutes")
const customerRoutes = require("./routes/customerRoutes")
const supplierRoutes = require("./routes/supplierRoutes")
const reportRoutes = require("./routes/reportRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const seedRoutes = require("./routes/seedRoutes")

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
})
app.use("/api/", limiter)

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`)
  next()
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/sales", salesRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/purchases", purchaseRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/seed", seedRoutes)

// 404 handler
app.use(notFound)

// Error handler
app.use(errorHandler)

module.exports = app

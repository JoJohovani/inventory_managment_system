const userService = require("../services/userService")

const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await userService.getSuppliers()

    res.json({
      success: true,
      data: suppliers,
    })
  } catch (error) {
    next(error)
  }
}

const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params
    const supplier = await userService.getUserById(Number.parseInt(id))

    // Verify this is actually a supplier
    if (supplier.role.role_type !== "supplier") {
      return res.status(400).json({
        success: false,
        message: "User is not a supplier",
      })
    }

    res.json({
      success: true,
      data: supplier,
    })
  } catch (error) {
    next(error)
  }
}

const createSupplier = async (req, res, next) => {
  try {
    // Find supplier role
    const { prisma } = require("../config/db")
    const supplierRole = await prisma.role.findUnique({
      where: { role_type: "supplier" },
    })

    if (!supplierRole) {
      return res.status(400).json({
        success: false,
        message: "Supplier role not found. Please create supplier role first.",
      })
    }

    const supplierData = {
      ...req.body,
      roleId: supplierRole.role_id,
    }

    const result = await userService.registerUser(supplierData)

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: result.user,
    })
  } catch (error) {
    next(error)
  }
}

const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params
    const supplier = await userService.updateUser(Number.parseInt(id), req.body)

    res.json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
    })
  } catch (error) {
    next(error)
  }
}

const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params
    await userService.deleteUser(Number.parseInt(id))

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
}

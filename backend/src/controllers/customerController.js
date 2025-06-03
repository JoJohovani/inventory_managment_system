const userService = require("../services/userService")

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await userService.getCustomers()

    res.json({
      success: true,
      data: customers,
    })
  } catch (error) {
    next(error)
  }
}

const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params
    const customer = await userService.getUserById(Number.parseInt(id))

    // Verify this is actually a customer
    if (customer.role.role_type !== "customer") {
      return res.status(400).json({
        success: false,
        message: "User is not a customer",
      })
    }

    res.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    next(error)
  }
}

const createCustomer = async (req, res, next) => {
  try {
    // Find customer role
    const { prisma } = require("../config/db")
    const customerRole = await prisma.role.findUnique({
      where: { role_type: "customer" },
    })

    if (!customerRole) {
      return res.status(400).json({
        success: false,
        message: "Customer role not found. Please create customer role first.",
      })
    }

    const customerData = {
      ...req.body,
      roleId: customerRole.role_id,
    }

    const result = await userService.registerUser(customerData)

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: result.user,
    })
  } catch (error) {
    next(error)
  }
}

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params
    const customer = await userService.updateUser(Number.parseInt(id), req.body)

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    })
  } catch (error) {
    next(error)
  }
}

const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params
    await userService.deleteUser(Number.parseInt(id))

    res.json({
      success: true,
      message: "Customer deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}

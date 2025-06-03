const express = require("express");
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const {
  validateRegister,
  validateUpdateUser,
} = require("../validators/userValidator");

const router = express.Router();

router.use(authenticate);

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.post(
  "/",
  authorize("admin", "manager", "cashier"),
  validateRegister,
  createCustomer
);
router.put(
  "/:id",
  authorize("admin", "manager"),
  validateUpdateUser,
  updateCustomer
);
router.delete("/:id", authorize("admin", "manager"), deleteCustomer);

module.exports = router;

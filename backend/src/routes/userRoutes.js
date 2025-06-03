const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCustomers,
  getSuppliers,
} = require("../controllers/userController");
const {
  authenticate,
  authorize,
  adminOnly,
} = require("../middlewares/authMiddleware");
const {
  validateRegister,
  validateUpdateUser,
} = require("../validators/userValidator");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin", "manager"), getAllUsers);
router.get("/customers", getCustomers);
router.get("/suppliers", getSuppliers);
router.get("/:id", getUserById);
router.post("/", adminOnly, validateRegister, createUser);
router.put(
  "/:id",
  authorize("admin", "manager"),
  validateUpdateUser,
  updateUser
);
router.delete("/:id", adminOnly, deleteUser);

module.exports = router;

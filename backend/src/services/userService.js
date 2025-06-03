const userRepository = require("../repositories/userRepository");
const { hashPassword, comparePassword } = require("../utils/helpers");
const { generateToken } = require("../config/jwt");
const logger = require("../utils/logger");

class UserService {
  async registerUser(userData) {
    const { email, password, firstName, lastName, phone, roleId } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await userRepository.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      roleId,
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User registered: ${email}`);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async loginUser(email, password) {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${email}`);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getUserProfile(userId) {
    const user = await userRepository.findUnique(
      { id: userId },
      { role: true }
    );
    if (!user) {
      throw new Error("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserProfile(userId, updateData) {
    const user = await userRepository.updateUser(userId, updateData);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers(page = 1, limit = 10, search = "") {
    return await userRepository.findActiveUsers(page, limit, search);
  }

  async getUserById(userId) {
    const user = await userRepository.findUnique(
      { id: userId, isDeleted: false },
      { role: true }
    );
    if (!user) {
      throw new Error("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(userId, updateData) {
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const user = await userRepository.updateUser(userId, updateData);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(userId) {
    const user = await userRepository.findUnique({
      id: userId,
      isDeleted: false,
    });
    if (!user) {
      throw new Error("User not found");
    }

    await userRepository.softDelete({ id: userId });
    logger.info(`User deleted: ${user.email} (ID: ${userId})`);
  }

  async getCustomers() {
    return await userRepository.findCustomers();
  }

  async getSuppliers() {
    return await userRepository.findSuppliers();
  }

  async getUsersByRole(roleId) {
    return await userRepository.findByRole(roleId);
  }
}

module.exports = new UserService();

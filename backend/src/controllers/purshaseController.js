const purchaseService = require("../services/purchaseService");

const createPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.createPurchase(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPurchases = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      supplierId,
      status,
    } = req.query;
    const filters = { startDate, endDate, supplierId, status };

    const result = await purchaseService.getAllPurchases(page, limit, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPurchaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const purchase = await purchaseService.getPurchaseById(Number.parseInt(id));

    res.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

const updatePurchaseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const purchase = await purchaseService.updatePurchaseStatus(
      Number.parseInt(id),
      status
    );

    res.json({
      success: true,
      message: "Purchase status updated successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

const deletePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    await purchaseService.deletePurchase(Number.parseInt(id));

    res.json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const receivePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const purchase = await purchaseService.receivePurchase(Number.parseInt(id));

    res.json({
      success: true,
      message: "Purchase received successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchaseStatus,
  deletePurchase,
  receivePurchase,
};

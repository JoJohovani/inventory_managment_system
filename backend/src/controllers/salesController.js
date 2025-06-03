const saleService = require("../services/saleService");

const createSale = async (req, res, next) => {
  try {
    const sale = await saleService.createSale(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

const getAllSales = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      customerId,
      status,
    } = req.query;
    const filters = { startDate, endDate, customerId, status };

    const result = await saleService.getAllSales(page, limit, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sale = await saleService.getSaleById(Number.parseInt(id));

    res.json({
      success: true,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

const updateSaleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const sale = await saleService.updateSaleStatus(
      Number.parseInt(id),
      status
    );

    res.json({
      success: true,
      message: "Sale status updated successfully",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    await saleService.deleteSale(Number.parseInt(id));

    res.json({
      success: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSaleStatus,
  deleteSale,
};

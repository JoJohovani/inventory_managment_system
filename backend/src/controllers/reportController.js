const saleService = require("../services/saleService");
const purchaseService = require("../services/purchaseService");
const productService = require("../services/productService");
const categoryService = require("../services/categoryService");

const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const report = await saleService.getSalesReport(startDate, endDate);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getPurchaseReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const report = await purchaseService.getPurchaseReport(startDate, endDate);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryReport = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const products = await productService.getAllProducts(page, limit, {});
    const lowStockProducts = await productService.getLowStockProducts();
    const categoryStats = await categoryService.getCategoryStats();

    const totalValue = products.data.reduce((sum, product) => {
      return sum + product.quantity * product.price;
    }, 0);

    const totalQuantity = products.data.reduce((sum, product) => {
      return sum + product.quantity;
    }, 0);

    res.json({
      success: true,
      data: {
        products: products.data,
        summary: {
          totalProducts: products.pagination.total,
          totalValue,
          totalQuantity,
          lowStockCount: lowStockProducts.products.length,
        },
        lowStockProducts: lowStockProducts.products,
        categoryStats,
        pagination: products.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTopSellingProducts = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const topProducts = await saleService.getTopSellingProducts(
      startDate,
      endDate,
      Number.parseInt(limit)
    );

    res.json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get daily stats
    const dailySales = await saleService.getSalesReport(startOfDay, endOfDay);
    const dailyPurchases = await purchaseService.getPurchaseReport(
      startOfDay,
      endOfDay
    );

    // Get monthly stats
    const monthlySales = await saleService.getSalesReport(
      startOfMonth,
      endOfMonth
    );
    const monthlyPurchases = await purchaseService.getPurchaseReport(
      startOfMonth,
      endOfMonth
    );

    // Get inventory stats
    const lowStockProducts = await productService.getLowStockProducts();
    const categoryStats = await categoryService.getCategoryStats();

    res.json({
      success: true,
      data: {
        daily: {
          sales: {
            count: dailySales.totalSales,
            revenue: dailySales.totalRevenue,
          },
          purchases: {
            count: dailyPurchases.totalPurchases,
            cost: dailyPurchases.totalCost,
          },
        },
        monthly: {
          sales: {
            count: monthlySales.totalSales,
            revenue: monthlySales.totalRevenue,
          },
          purchases: {
            count: monthlyPurchases.totalPurchases,
            cost: monthlyPurchases.totalCost,
          },
        },
        inventory: {
          lowStockCount: lowStockProducts.products.length,
          totalCategories: categoryStats.length,
          totalValue: categoryStats.reduce(
            (sum, cat) => sum + cat.totalValue,
            0
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getTopSellingProducts,
  getDashboardStats,
};

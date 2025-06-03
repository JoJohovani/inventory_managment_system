const categoryRepository = require("../repositories/categoryRepository")
const logger = require("../utils/logger")

class CategoryService {
  async createCategory(categoryData) {
    const { name, description } = categoryData

    // Check if category already exists
    const existingCategory = await categoryRepository.findByName(name)
    if (existingCategory) {
      throw new Error("Category with this name already exists")
    }

    const category = await categoryRepository.create({
      name,
      description,
    })

    logger.info(`Category created: ${name} (ID: ${category.id})`)
    return category
  }

  async getAllCategories(page = 1, limit = 10, search = "") {
    return await categoryRepository.findActiveCategories(page, limit, search)
  }

  async getCategoryById(categoryId) {
    const category = await categoryRepository.findCategoryWithProducts(categoryId)
    if (!category) {
      throw new Error("Category not found")
    }
    return category
  }

  async updateCategory(categoryId, updateData) {
    // Check if category exists
    const existingCategory = await categoryRepository.findUnique({ id: categoryId, isDeleted: false })
    if (!existingCategory) {
      throw new Error("Category not found")
    }

    // Check for duplicate name (if updating name)
    if (updateData.name && updateData.name !== existingCategory.name) {
      const duplicateName = await categoryRepository.findByName(updateData.name)
      if (duplicateName) {
        throw new Error("Category with this name already exists")
      }
    }

    const category = await categoryRepository.update({ id: categoryId }, updateData)

    logger.info(`Category updated: ${category.name} (ID: ${category.id})`)
    return category
  }

  async deleteCategory(categoryId) {
    const category = await categoryRepository.findCategoryWithProducts(categoryId)
    if (!category) {
      throw new Error("Category not found")
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
      throw new Error("Cannot delete category with existing products. Please move or delete products first.")
    }

    await categoryRepository.softDelete({ id: categoryId })
    logger.info(`Category deleted: ${category.name} (ID: ${categoryId})`)
  }

  async getCategoryStats() {
    return await categoryRepository.getCategoryStats()
  }

  async getCategoriesWithProductCount() {
    const categories = await categoryRepository.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: {
            products: {
              where: { isDeleted: false },
            },
          },
        },
      },
    })

    return categories.map((category) => ({
      ...category,
      productCount: category._count.products,
    }))
  }
}

module.exports = new CategoryService()

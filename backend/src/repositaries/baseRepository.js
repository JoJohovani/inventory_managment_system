const { prisma } = require("../config/db");

class BaseRepository {
  constructor(model) {
    this.model = model;
    this.prisma = prisma;
  }

  async findMany(options = {}) {
    return await this.prisma[this.model].findMany(options);
  }

  async findUnique(where, include = {}) {
    return await this.prisma[this.model].findUnique({
      where,
      include,
    });
  }

  async findFirst(where, include = {}) {
    return await this.prisma[this.model].findFirst({
      where,
      include,
    });
  }

  async create(data, include = {}) {
    return await this.prisma[this.model].create({
      data,
      include,
    });
  }

  async update(where, data, include = {}) {
    return await this.prisma[this.model].update({
      where,
      data,
      include,
    });
  }

  async delete(where) {
    return await this.prisma[this.model].delete({
      where,
    });
  }

  async softDelete(where) {
    return await this.prisma[this.model].update({
      where,
      data: { isDeleted: true },
    });
  }

  async count(where = {}) {
    return await this.prisma[this.model].count({ where });
  }

  async findManyWithPagination(
    where = {},
    page = 1,
    limit = 10,
    include = {},
    orderBy = {}
  ) {
    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);

    const [data, total] = await Promise.all([
      this.prisma[this.model].findMany({
        where,
        include,
        skip,
        take,
        orderBy,
      }),
      this.prisma[this.model].count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = BaseRepository;

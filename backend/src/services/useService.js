import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Example usage:
export const getAllUsers = async () => {
  return await prisma.user.findMany();
};

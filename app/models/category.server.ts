
import { prisma } from "~/db.server";
import type { Prisma } from "@prisma/client";

export type Category = Prisma.CategoryGetPayload<{}>;

export async function getCategoriesByUserId(userId: string) {
  return await prisma.category.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function createCategory(categoryObj: Category){
  return await prisma.category.create({
    data: categoryObj
  })
}

export async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: {
      id
    }
  })
}
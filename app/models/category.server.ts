
import { prisma } from "~/db.server";
import type { Prisma } from "@prisma/client";

export type Category = Prisma.CategoryGetPayload<{}>;

export async function getCategories() {
  return await prisma.category.findMany({})
}


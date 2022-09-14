import type { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

export type Budget = Prisma.BudgetGetPayload<{}>;

export function getCurrentBudget(budgets: Budget[], currDate: Date) {
  const currBudget = budgets.find(
    (budget) =>
      currDate >= budget.startDate &&
      (!budget.endDate || currDate < budget.endDate)
  );

  return currBudget;
}

export async function getBudgetsByUserId(userId: string) {
  return await prisma.budget.findMany({
    where: {
      userId
    },
    orderBy: {
      startDate: "desc",
    },
  })
}

export async function createBudget(budgetObj: Budget) {
  return await prisma.budget.create({
    data: budgetObj,
  });
}

export async function deleteBudget(id: string) {
  return await prisma.budget.delete({
    where: {
      id
    }
  })
}
import type { Prisma } from "@prisma/client";

export function getCurrentBudget(budgets: Prisma.BudgetGetPayload<{}>[], currDate: Date) {
  const currBudget = budgets.find(
    (budget) =>
      currDate >= budget.startDate &&
      (!budget.endDate || currDate < budget.endDate)
  );

  return currBudget;
}

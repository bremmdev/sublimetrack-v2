import type { Prisma, Expense } from "@prisma/client";
import { prisma } from "~/db.server";

export type ExpenseWithCategory = Prisma.ExpenseGetPayload<{
  include: { Category: true };
}>;



export async function getExpensesByUserId(userId: string) {
  return await prisma.expense.findMany({
    where: {
      userId,
    },
    include: {
      Category: true,
    },
    orderBy: [
      {
        date: "desc",
      },
      {
        title: "asc",
      },
    ],
  });
}

export async function createExpense(expenseObj: Expense) {
  return await prisma.expense.create({
    data: expenseObj
  })
}

export async function deleteExpense(id: string) {
  return await prisma.expense.delete({
    where: {
      id,
    },
  });
}

export function getExpensesForCurrentMonth(
  expenses: ExpenseWithCategory[],
  startOfMonth: Date,
  endOfMonth: Date
) {
  const expensesCurrentMonth = expenses.filter(
    (expenses) => expenses.date >= startOfMonth && expenses.date < endOfMonth
  );
  const expenseAmount = expensesCurrentMonth.reduce(
    (sum, expense) => sum + +expense.amount,
    0
  );

  return { expensesCurrentMonth, expenseAmount };
}

import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import expenseStyles from "~/styles/expenses.css";
import {
  deleteExpense,
  getExpensesByUserId,
  createExpense,
  type ExpenseWithCategory,
} from "~/models/expense.server";
import invariant from "tiny-invariant";
import ExpenseItem from "~/components/Expenses/ExpenseItem";
import { v4 as uuid } from "uuid";
import { Prisma } from "@prisma/client";
import React, { useState, useRef } from "react";

export const links = () => [
  { href: globalStyles, rel: "stylesheet" },
  { href: utilStyles, rel: "stylesheet" },
  { href: expenseStyles, rel: "stylesheet" },
];

type LoaderData = {
  expenses: ExpenseWithCategory[];
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "create") {
    const expense = {
      id: uuid(),
      title: "Eerste",
      amount: new Prisma.Decimal(35),
      date: new Date(),
      userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      categoryId: "d05a1cdd-5341-4abd-9a53-e1a012d0dd3d",
    };
    await createExpense(expense);
  }

  if (action === "delete") {
    const expenseId = formData.get("expense_id");
    invariant(typeof expenseId === "string", "Expense not found!");

    try {
      const deletedExpense = await deleteExpense(expenseId);
      if (!deletedExpense) {
        throw new Error(`Deleting expense ${expenseId} failed`);
      }
    } catch (e) {
      return json({ error: "Deleting expense failed" });
    }
  }

  return null;
};

export const loader: LoaderFunction = async () => {
  const expenses = await getExpensesByUserId(
    "70e0cff2-7589-4de8-9f2f-4e372a5a15f3"
  );
  return json<LoaderData>({ expenses });
};

export default function ExpensesRoute() {
  const { expenses } = useLoaderData() as unknown as LoaderData;

  //state for expenses filtered on search
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  console.log(expenses);

  const filterExpensesOnSearch = () => {
    const query = searchInputRef.current?.value ?? "";
    const filteredExpenses = expenses.filter((expense) =>
      expense.title.toLowerCase().includes(query?.toLowerCase())
    );
    setFilteredExpenses(filteredExpenses);
  };

  let expensesContent;

  if (expenses.length === 0) {
    expensesContent = <p className="my-1">There are currently no expenses.</p>;
  }

  if (expenses && expenses.length > 0) {
    expensesContent = (
      <ul className="my-1">
        {filteredExpenses.map((expense) => (
          <ExpenseItem expense={expense} key={expense.id} deletable />
        ))}
      </ul>
    );
  }

  return (
    <div className="container-constrained">
      <div className="expenses-header flex-column">
        <div className="expenses-header-inner flex">
          <h2>Expenses</h2>
          <Link
            to="/new"
            prefetch="intent"
            className="btn-primary btn align-right"
          >
            Add Expense
          </Link>
        </div>
        <div className="expenses-header-filters flex">
          <input type="date" className="datepicker" />
          <input type="text" className="filter-category" />
          <input
            type="text"
            placeholder="Search..."
            className="search-field"
            ref={searchInputRef}
            onChange={filterExpensesOnSearch}
          />
        </div>
      </div>

      <div className="expenses-list flex-column">{expensesContent}</div>
    </div>
  );
}

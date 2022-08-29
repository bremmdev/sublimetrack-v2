import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import expenseStyles from "~/styles/expenses.css";
import {
  deleteExpense,
  getExpensesByUserId,
  type ExpenseWithCategory,
} from "~/models/expense.server";
import invariant from "tiny-invariant";
import ExpenseItem from "~/components/Expenses/ExpenseItem";

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
  const expenseId = formData.get("expense_id");
  invariant(typeof expenseId === "string", "Expense not found!");
  await deleteExpense(expenseId);
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
  // console.log(expenses)

  let expensesContent;

  if (expenses.length === 0) {
    expensesContent = <p className="my-1">There are currently no expenses.</p>;
  }

  if (expenses && expenses.length > 0) {
    expensesContent = (
      <ul className="my-1">
        {expenses.map((expense) => (
          <ExpenseItem expense={expense} key={expense.id} deletable />
        ))}
      </ul>
    );
  }

  return (
    <div className="container-constrained">
      <h2>Expenses</h2>
      <div className="expenses-list flex-column">{expensesContent}</div>
    </div>
  );
}

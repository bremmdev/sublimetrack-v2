import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUserById } from "~/models/user.server";
import { getCurrDate } from "~/models/date.server";
import { getCurrentBudget } from "~/models/budget.server";
import {
  getExpensesByUserId,
  getExpensesForCurrentMonth,
  type ExpenseWithCategory,
} from "~/models/expense.server";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import overviewStyles from "~/styles/overview.css";
import expenseStyles from "~/styles/expenses.css";
import progressbarStyles from "~/styles/progressbar.css";
import React from "react";
import ExpenseItem from "~/components/Expenses/ExpenseItem";
import ProgressBar from "~/components/Overview/ProgressBar";

export const links = () => [
  { href: globalStyles, rel: "stylesheet" },
  { href: utilStyles, rel: "stylesheet" },
  { href: overviewStyles, rel: "stylesheet" },
  { href: expenseStyles, rel: "stylesheet" },
  { href: progressbarStyles, rel: "stylesheet" },
];

type LoaderData = {
  firstName: string;
  currentBudget: number;
  latestExpenses: ExpenseWithCategory[];
  expenseAmount: number;
};

export const loader: LoaderFunction = async () => {
  const user = await getUserById("70e0cff2-7589-4de8-9f2f-4e372a5a15f3");

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  const { currDate, startOfMonth, endOfMonth } = getCurrDate();

  const currentBudget = getCurrentBudget(user.Budget, currDate);
  const expenses = await getExpensesByUserId(user.id);

  const { expensesCurrentMonth, expenseAmount } = getExpensesForCurrentMonth(
    expenses,
    startOfMonth,
    endOfMonth
  );

  return json<LoaderData>({
    firstName: user.firstName,
    currentBudget: +(currentBudget?.amount || 0),
    latestExpenses: expensesCurrentMonth.slice(0, 5),
    expenseAmount,
  });
};

export default function IndexRoute() {
  const { firstName, currentBudget, expenseAmount, latestExpenses } =
    useLoaderData() as unknown as LoaderData;

  const currDateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const balanceAmount = currentBudget - expenseAmount;

  let latestExpensesContent: React.ReactElement = <p>Loading...</p>;

  if (latestExpenses.length === 0) {
    latestExpensesContent = <p>There are currently no expenses.</p>;
  }

  if (latestExpenses && latestExpenses.length > 0) {
    latestExpensesContent = (
      <ul>
        {latestExpenses.map((expense) => (
          <ExpenseItem expense={expense} key={expense.id} />
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="intro-text">
        <h2>
          Hi, <span className="accent-text">{`${firstName}!`}</span>
        </h2>
        <p className="date-message">
          Today is <span className="accent-text">{currDateStr}</span>
        </p>
      </div>
      <div className="grid my-3">
        <section className="summary-card">
          <div className="summary-card-balance">
            <h3>Balance</h3>
            <span className="accent-text large-text">
              ${balanceAmount.toFixed(2)}
            </span>
          </div>
          <div className="summary-card-budget">
            <h3>Budget</h3>
            <span className="accent-text large-text">
              ${currentBudget.toFixed(2)}
            </span>
          </div>
          <div className="summary-card-expenses">
            <h3>Expenses</h3>
            <span className="accent-text large-text">
              ${expenseAmount.toFixed(2)}
            </span>
          </div>
        </section>

        <ProgressBar
          budgetAmount={currentBudget}
          expenseAmount={expenseAmount}
        />

        <section className="expenses-list flex-column">
          <h3>Latest expenses</h3>
          {latestExpensesContent}
          <Link
            to="/expenses"
            prefetch="intent"
            className="btn-primary btn align-right"
          >
            All Expenses
          </Link>
        </section>
        <section className="flex justify-center">Expenses per category doughnutchart</section>
      </div>
    </>
  );
}

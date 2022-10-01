import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link, useTransition } from "@remix-run/react";
import { getUserById } from "~/models/user.server";
import { getCurrDate } from "~/models/date.server";
import { getCurrentBudget } from "~/models/budget.server";
import {
  getExpenses,
  getExpensesForCurrentMonth,
  type ExpenseWithCategory,
} from "~/models/expense.server";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import overviewStyles from "~/styles/overview.css";
import expenseStyles from "~/styles/expenses.css";
import progressbarStyles from "~/styles/progressbar.css";
import chartStyles from "~/styles/charts.css";
import React from "react";
import ExpenseItem from "~/components/Expenses/ExpenseItem";
import ProgressBar from "~/components/Overview/ProgressBar";
import DoughnutChart from "~/components/Charts/DoughnutChart";

export const links = () => [
  { href: globalStyles, rel: "stylesheet" },
  { href: utilStyles, rel: "stylesheet" },
  { href: overviewStyles, rel: "stylesheet" },
  { href: expenseStyles, rel: "stylesheet" },
  { href: progressbarStyles, rel: "stylesheet" },
  { href: chartStyles, rel: "stylesheet" }
];

type LoaderData = {
  firstName: string;
  currentBudget: number;
  expenses: ExpenseWithCategory[];
  expenseAmount: number;
};

export const loader: LoaderFunction = async () => {
  const user = await getUserById("70e0cff2-7589-4de8-9f2f-4e372a5a15f3");

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  const { currDate, startOfMonth, endOfMonth } = getCurrDate();

  const currentBudget = getCurrentBudget(user.Budget, currDate);

  const expensesFilter = {
    userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
    date: {
      gte: startOfMonth,
    },
  };

  const expenses = await getExpenses(expensesFilter);

  if (!expenses) {
    throw new Response("Expenses not found", { status: 404 });
  }

  const { expensesCurrentMonth, expenseAmount } = getExpensesForCurrentMonth(
    expenses,
    endOfMonth
  );

  return json<LoaderData>({
    firstName: user.firstName,
    currentBudget: +(currentBudget?.amount || 0),
    expenses: expensesCurrentMonth,
    expenseAmount,
  });
};

export default function IndexRoute() {
  const { firstName, currentBudget, expenseAmount, expenses } =
    useLoaderData() as unknown as LoaderData;

  const transition = useTransition();

  const currDateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const balanceAmount = currentBudget - expenseAmount;

  let expensesContent: React.ReactElement = <p>Loading...</p>;

  if (expenses.length === 0) {
    expensesContent = <p className="my-1">There are no expenses this month.</p>;
  }

  if (expenses && expenses.length > 0) {
    expensesContent = (
      <ul>
        {expenses.slice(0, 5).map((expense) => (
          <ExpenseItem expense={expense} key={expense.id} />
        ))}
      </ul>
    );
  }

  if (transition.state === "loading") {
    return <div className="spinner"></div>;
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
          {expensesContent}
          <Link
            to="/expenses"
            prefetch="intent"
            className="btn-primary btn align-right"
          >
            All Expenses
          </Link>
        </section>
        <section className="flex-column centered justify-center">
          <h3>Expenses per category</h3>
          {expenses.length === 0 ? <p className="my-1">There are no expenses this month.</p> : <DoughnutChart expenses={expenses} /> }
        </section>
      </div>
    </>
  );
}

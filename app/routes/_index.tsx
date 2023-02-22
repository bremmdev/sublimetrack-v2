import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link, useTransition } from "@remix-run/react";
import { getCurrDate } from "~/models/date.server";
import { getCurrentBudget } from "~/models/budget.server";
import { type ExpenseWithCategory } from "~/models/expense.server";
import overviewStyles from "~/styles/overview.css";
import progressbarStyles from "~/styles/progressbar.css";
import React from "react";
import ExpenseItem from "~/components/Expenses/ExpenseItem";
import ProgressBar from "~/components/Overview/ProgressBar";
import DoughnutChart from "~/components/Charts/DoughnutChart";
import { prisma } from "~/db.server";

export const links = () => [
  { href: overviewStyles, rel: "stylesheet" },
  { href: progressbarStyles, rel: "stylesheet" },
];

type LoaderData = {
  firstName: string;
  currentBudget: number;
  expenses: ExpenseWithCategory[];
  expenseAmount: number;
};

export const loader: LoaderFunction = async () => {
  const { currDate, startOfMonth, endOfMonth } = getCurrDate();

  try {
    //only include the expenses for the current month
    const userWithBudgetsAndExpenses = await prisma.user.findUnique({
      where: {
        id: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
      },
      include: {
        Budget: true,
        Expense: {
          where: {
            date: {
              gte: startOfMonth,
              lt: endOfMonth,
            },
          },
          include: {
            Category: true,
          },
        },
      },
    });

    if (!userWithBudgetsAndExpenses) {
      throw new Response("User not found", { status: 404 });
    }

    //get the budget for the current month based on today's date
    const currentBudget = getCurrentBudget(
      userWithBudgetsAndExpenses.Budget,
      currDate
    );

    //calculate the total expense amount for this month's expenses
    const expenseAmount = userWithBudgetsAndExpenses.Expense.reduce(
      (sum, expense) => sum + +expense.amount,
      0
    );

    return json<LoaderData>({
      firstName: userWithBudgetsAndExpenses.firstName,
      currentBudget: +(currentBudget?.amount || 0),
      expenses: userWithBudgetsAndExpenses.Expense,
      expenseAmount,
    });
  } catch (e) {
    throw new Response("Fetching user data failed", { status: 404 });
  }
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
          {expenses.length === 0 ? (
            <p className="my-1">There are no expenses this month.</p>
          ) : (
            <DoughnutChart expenses={expenses} />
          )}
        </section>
      </div>
    </>
  );
}

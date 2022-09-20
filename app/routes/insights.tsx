import {
  useLoaderData,
  Form,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { type LoaderFunction, json } from "@remix-run/node";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import insightStyles from "~/styles/insights.css";
import chartStyles from "~/styles/charts.css";
import { getExpenses, type ExpenseWithCategory } from "~/models/expense.server";
import DoughnutChart from "~/components/Charts/DoughnutChart";
import BarChart from "~/components/Charts/BarChart";
import { useState } from "react";

export const links = () => [
  { href: globalStyles, rel: "stylesheet" },
  { href: utilStyles, rel: "stylesheet" },
  { href: insightStyles, rel: "stylesheet" },
  { href: chartStyles, rel: "stylesheet" },
];

type LoaderData = {
  expenses: ExpenseWithCategory[];
  selectedYear: number;
};

const validateYear = (year: string) => {
  return Number.isInteger(+year) && year.length === 4;
};

export const loader: LoaderFunction = async ({ request }) => {
  const currYear = new Date().getFullYear();
  const url = new URL(request.url);
  const year = new URLSearchParams(url.search).get("year");

  const selectedYear = year && validateYear(year) ? +year : currYear;

  const expensesFilter = {
    userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
    date: {
      gte: new Date(selectedYear, 0, 1),
      lt: new Date(selectedYear + 1, 0, 1),
    },
  };

  const expenses = await getExpenses(expensesFilter);

  if (!expenses) {
    throw new Response("Fetching expenses failed", { status: 404 });
  }

  return json<LoaderData>({ expenses, selectedYear });
};

export default function InsightsRoute() {
  const { expenses, selectedYear: initialYear } =
    useLoaderData() as unknown as LoaderData;

  const transition = useTransition();
  const submit = useSubmit();
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);

  if (transition.state === "loading") {
    return <div className="spinner"></div>;
  }

  const totalExpense =
    expenses?.reduce((acc, curr) => acc + +curr.amount, 0) || 0;
  //add a zero to parameters in order to default to 0 if there are no expenses
  const highestAmount = Math.max(...expenses.map((exp) => +exp.amount), 0);

  const isSubmitting = transition.state === "submitting";

  return (
    <>
      <div className="insights-header flex align-center gap-2">
        <h2>Insights</h2>
        <Form
          method="get"
          action="/insights"
          onChange={(e) => submit(e.currentTarget, { replace: true })}
        >
          <button
            disabled={isSubmitting}
            className="year-selector-prev"
            aria-label="previous year"
            onClick={(e) => {
              setSelectedYear((prevYear) => prevYear - 1);
            }}
          >
            {"<"}
          </button>
          <input
            className="year-selector"
            arial-label="year"
            type="text"
            name="year"
            id="year"
            readOnly
            value={selectedYear}
          ></input>
          <button
            disabled={isSubmitting}
            onClick={(e) => {
              setSelectedYear((prevYear) => prevYear + 1);
            }}
            className="year-selector-next"
            aria-label="next year"
          >
            {">"}
          </button>
        </Form>
      </div>

      <div className="grid">
        <div className="stats-container flex span-two">
          <div className="stat-card">
            <div className="stat-title">Expense count</div>
            <div>{expenses?.length || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total expenses</div>
            <div>{`$${totalExpense.toFixed(2)}`}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Highest expense</div>
            <div>{`$${highestAmount.toFixed(2)}`}</div>
          </div>
        </div>

        {expenses && expenses.length > 0 && (
          <div className="flex justify-between span-two chart-container">
            <div className="hidden-mobile-560">
              <h3 className="centered">Expenses per month</h3>
              {expenses && expenses.length !== 0 && (
                <>
                  <BarChart expenses={expenses} />
                </>
              )}
            </div>
            <div className="hidden-mobile-560">
              <h3 className="centered">Expenses per category</h3>
              {expenses && expenses.length !== 0 && (
                <>
                  <DoughnutChart expenses={expenses} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

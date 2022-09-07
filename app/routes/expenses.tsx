import {
  type ActionFunction,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  Link,
  Form,
  useSubmit,
  Outlet,
  useLocation,
  useTransition
} from "@remix-run/react";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import expenseStyles from "~/styles/expenses.css";
import {
  deleteExpense,
  getExpenses,
  createExpense,
  type ExpenseWithCategory,
} from "~/models/expense.server";
import invariant from "tiny-invariant";
import ExpenseItem from "~/components/Expenses/ExpenseItem";
import { v4 as uuid } from "uuid";
import { Prisma } from "@prisma/client";
import { useState, useRef } from "react";
import { getCategories, type Category } from "~/models/category.server";
import { getCurrDate } from "~/models/date.server";

export const links = () => [
  { href: globalStyles, rel: "stylesheet" },
  { href: utilStyles, rel: "stylesheet" },
  { href: expenseStyles, rel: "stylesheet" },
];

type LoaderData = {
  expenses: ExpenseWithCategory[];
  categories: Category[];
  from: string | null;
  cat: string | null;
  today_minus_30: Date;
};

const validateDate = (from: string) => {
  const fromDate = new Date(from);
  return !isNaN(+fromDate);
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  console.log('jaaa', action)

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

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const from = new URLSearchParams(url.search).get("from");
  const cat = new URLSearchParams(url.search).get("category");

  const { today_minus_30 } = getCurrDate();

  //set startDate to 30 days ago if tthere is no date or its invalid
  const startDate =
    from && validateDate(from) ? new Date(from) : today_minus_30;

  const categories = await getCategories();

  if (!categories) {
    throw new Response("Categories not found", { status: 404 });
  }

  const selectedCat = categories.find((category) => category.name === cat);

  const expensesFilter = {
    userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
    categoryId: selectedCat?.id,
    date: {
      gte: startDate,
    },
  };

  const expenses = await getExpenses(expensesFilter);

  if (!expenses) {
    throw new Response("Loading expenses failed", { status: 404 });
  }

  return json<LoaderData>({ expenses, categories, from, cat, today_minus_30 });
};

export default function ExpensesRoute() {
  const { expenses, categories, from, cat, today_minus_30 } =
    useLoaderData() as unknown as LoaderData;

  //state for expenses filtered on search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const submit = useSubmit();
  const location = useLocation();
  const transition = useTransition()
  console.log(transition, location)

  const filterExpenses = (expenses: ExpenseWithCategory[], query: string) => {
    if (query === "") return expenses;
    return expenses.filter((exp) =>
      exp.title.toLowerCase().includes(query?.toLowerCase())
    );
  };

  let expensesContent;

  if (expenses.length === 0) {
    expensesContent = <p className="my-2">There are currently no expenses.</p>;
  }

  if (expenses && expenses.length > 0) {
    expensesContent = (
      <ul className="my-1">
        {filterExpenses(expenses, searchQuery).map((expense) => (
          <ExpenseItem expense={expense} key={expense.id} deletable />
        ))}
      </ul>
    );
  }

  if(transition.state === 'loading'){
    return <div className="spinner"></div>
  }

  return (
    <div className="container-constrained">
      <div className="expenses-header flex-column">
        <div className="expenses-header-inner flex">
          <h2>Expenses</h2>
          <Link
            to="new"
            prefetch="intent"
            className="btn-primary btn align-right"
          >
            Add Expense
          </Link>
        </div>
        <div className="expenses-header-filters flex">
          <Form
            action="/expenses"
            className="filter-form flex"
            onChange={(e) => submit(e.currentTarget, { replace: true })}
          >
            <input
              type="date"
              name="from"
              className="datepicker"
              disabled={location.pathname === "/expenses/new"}
              defaultValue={
                from && validateDate(from)
                  ? from
                  : today_minus_30.toLocaleString().split("T")[0]
              }
            />

            <select
              name="category"
              className="filter-category"
              defaultValue={cat ? cat : ""}
              disabled={location.pathname === "/expenses/new"}
            >
              <option value="" style={{ color: "#666", fontWeight: "700" }}>
                Select category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Form>

          <input
            type="text"
            placeholder="Search..."
            className="search-field"
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={location.pathname === "/expenses/new"}
          />
        </div>
      </div>
  
      {/*New expense outlet */}
      <Outlet />

      <div className="expenses-list flex-column">{expensesContent}</div>
    </div>
  );
}

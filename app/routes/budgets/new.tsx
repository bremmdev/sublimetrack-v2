import {
  type ActionFunction,
  json,
  type LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useTransition,
  useLoaderData,
} from "@remix-run/react";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import formStyles from "~/styles/form.css";
import { v4 as uuid } from "uuid";
import { getBudgetsByUserId, createBudget } from "~/models/budget.server";
import { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";
import FormActions from "~/components/Forms/FormActions";

export const links = () => [
  { href: globalStyles, rel: "stylesheet" },
  { href: utilStyles, rel: "stylesheet" },
  { href: formStyles, rel: "stylesheet" },
];

/* TYPE DEFS */
type FormValues = Record<string, string>;
type ErrorObj = Record<string, string | null>;

type ActionData = {
  error: ErrorObj;
  values: FormValues;
};

//VALIDATION FUNCTIONS
const validateStartDate = (date: Date, latestBudgetDate?: Date) => {
  if (!latestBudgetDate) {
    return date.getDate() === 1
      ? null
      : "Date must be the first day of the month";
  }
  return date.getDate() === 1 && date > latestBudgetDate
    ? null
    : "Date must be the first day of a future month";
};
const validateAmount = (amount: number) =>
  amount >= 0 && amount < 1000000
    ? null
    : "Amount must be between 0 and 1000000";

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData) as FormValues;

  const { startDate, amount } = values;

  //fetch budgets, needed for validation
  const budgets = await getBudgetsByUserId(
    "70e0cff2-7589-4de8-9f2f-4e372a5a15f3"
  );

  if (!budgets) {
    throw new Response("Budgets not found", { status: 404 });
  }

  //we need to have the startDate of our latest budget. New budget must have startDate greater than this
  const latestBudgetStartDate = budgets[0]?.startDate ?? null;

  const error = {
    startDate: validateStartDate(new Date(startDate), latestBudgetStartDate),
    amount: validateAmount(+amount),
  };

  //check if any of the fields is invalid
  const hasError = Object.values(error).some((v) => v);

  //send filled in user values back to client along with the errors
  if (hasError) {
    return json<ActionData>({ error, values }, { status: 400 });
  }

  //create new budget
  const budget = {
    id: uuid(),
    startDate: new Date(startDate),
    endDate: null,
    amount: new Prisma.Decimal(amount),
    userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
  };

  //put startDate of new budget as endDate on current budget
  //only do this if there are already budgets
  try {
    if (budgets.length > 0) {
      await prisma.$transaction([
        prisma.budget.update({
          where: {
            id: budgets[0].id,
          },
          data: {
            endDate: new Date(startDate),
          },
        }),
        prisma.budget.create({
          data: budget,
        }),
      ]);
    } else {
      await createBudget(budget);
    }
  } catch (e) {
    throw new Error("transaction failed");
  }

  return redirect("/budgets");
};

export const loader: LoaderFunction = async ({ request }) => {
  const budgets = await getBudgetsByUserId(
    "70e0cff2-7589-4de8-9f2f-4e372a5a15f3"
  );
  if (!budgets) {
    throw new Response("Loading form failed", { status: 404 });
  }
  //check for an existing future budget, needed for warning message to user
  const futureBudget = budgets.find(
    (budget) => new Date(budget.startDate) > new Date()
  );
  return futureBudget ? true : false;
};

export default function NewBudgetRoute() {
  const actionData = useActionData() as ActionData;
  const hasFutureBudget: boolean = useLoaderData();
  const transition = useTransition();

  const isAdding = transition?.submission?.formData.get("_action") === "create";

  //calculate the first day of next month as default
  const currDate = new Date();
  const firstDayNextMonth = new Date(
    currDate.getFullYear(),
    currDate.getMonth() + 1,
    1
  ).toLocaleDateString();
  let [month, day, year] = firstDayNextMonth.split("/");
  //add pending 0 if month does not have 2 digits
  month = month.length === 2 ? month : `0${month}`;
  const defaultStartDate = `${year}-${month}-0${day}`;

  return (
    <div className="form-wrapper">
      {hasFutureBudget && (
        <p className="error centered">
          There is already a future budget. Delete it before creating a new one.
        </p>
      )}
      <Form method="post" className="form">
        <fieldset disabled={isAdding}>
          <div className="form-control">
            <label htmlFor="startDate">Start date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              defaultValue={defaultStartDate}
            />
          </div>
          {actionData?.error.startDate && (
            <div className="error">{actionData.error.startDate}</div>
          )}
          <div className="form-control">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0.00"
              name="amount"
              defaultValue="0.00"
            />
          </div>
          {actionData?.error.amount && (
            <div className="error">{actionData.error.amount}</div>
          )}
        </fieldset>
        <FormActions
          redirectTo="/budgets"
          isAdding={isAdding}
          shouldDisableSubmit={isAdding || hasFutureBudget}
        />
      </Form>
    </div>
  );
}

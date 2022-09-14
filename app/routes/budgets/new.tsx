import {
  type ActionFunction,
  json,
  type LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Link,
  Form,
  useActionData,
  useTransition,
} from "@remix-run/react";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import formStyles from "~/styles/form.css";
import { v4 as uuid } from "uuid";
import { getBudgetsByUserId, createBudget, type Budget } from "~/models/budget.server";
import { Prisma } from "@prisma/client";
import { prisma } from "~/db.server";

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
  return (date.getDate() === 1 && (!latestBudgetDate || date > latestBudgetDate)) ? null : 'Date must be the first day of a future month'
}
const validateAmount = (amount: number) => amount >= 0 && amount < 1000000;

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData) as FormValues;

  const { startDate, amount, _action } = values;

  console.log(startDate);

  //fetch categories, needed for validation
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
    amount: validateAmount(+amount)
      ? null
      : "Amount must be between 0 and 1000000",
  };

  //check if any of the fields is invalid
  const hasError = Object.values(error).some((v) => v);

  //send filled in user values back to client along with the errors
  if (hasError) {
    return json<ActionData>({ error, values }, { status: 400 });
  }

  //put startDate of new budget as endDate on current budget
  if (budgets.length > 0) {
    await prisma.budget.update({
      where: {
        id: budgets[0].id,
      },
      data: {
        endDate: new Date(startDate),
      },
    });
  }

  //no errors so add budget
  const budget = {
    id: uuid(),
    startDate: new Date(startDate),
    endDate: null,
    amount: new Prisma.Decimal(amount),
    userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
  };
  await createBudget(budget);

  return redirect("/budgets");
};

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};

export default function NewBudgetRoute() {
  const actionData = useActionData() as ActionData;
 
  const transition = useTransition();

  const isAdding = transition?.submission?.formData.get('_action') === 'create';

  const currDate = new Date()
  const firstDayNextMonth =  new Date(currDate.getFullYear(), currDate.getMonth() + 1, 1).toLocaleDateString()
  let [month, day, year] = firstDayNextMonth.split('/')
  const defaultStartDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

  return (
    <div className="form-wrapper">
      <Form method="post" className="form">
        <fieldset disabled={isAdding}>
          <div className="form-control">
            <label htmlFor="startDate">Start date</label>
            <input type="date" id="startDate" name="startDate" defaultValue={defaultStartDate}/>
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
        <div className="form-actions flex justify-center">
          <button type="submit" className="btn btn-primary" name="_action" value="create" disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add'}
          </button>
          <Link
            to="/budgets"
            prefetch="intent"
            className={`btn-secondary btn ${isAdding ? 'disabled-link' : ""}`}
          >
            Go Back
          </Link>
        </div>
      </Form>
    </div>
  );
}

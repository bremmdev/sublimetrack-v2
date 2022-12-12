import {
  type ActionFunction,
  json,
  type LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useActionData,
  useTransition,
} from "@remix-run/react";
import formStyles from "~/styles/form.css";
import { createExpense } from "~/models/expense.server";
import { v4 as uuid } from "uuid";
import { Prisma } from "@prisma/client";
import { getCategoriesByUserId, type Category } from "~/models/category.server";
import FormActions from "~/components/Forms/FormActions";

export const links = () => [
  { href: formStyles, rel: "stylesheet" },
];

/* VALIDATION FUNCTIONS */
const validateTitle = (title: string) => title.length >= 2;
const validateAmount = (amount: number) => amount >= 0 && amount < 1000000;
const validateDate = (date: Date) => !isNaN(+date);

/* TYPE DEFS */
type FormValues = Record<string, string>;
type ErrorObj = Record<string, string | null>;

type LoaderData = {
  categories: Category[];
};

type ActionData = {
  error: ErrorObj;
  values: FormValues;
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData) as FormValues;
  const { title, amount, date, category } = values;

  const error = {
    title: validateTitle(title) ? null : "Title must be at least 2 characters",
    amount: validateAmount(+amount)
      ? null
      : "Amount must be between 0 and 1000000",
    date: validateDate(new Date(date)) ? null : "Please enter a valid date",
    category: category.length > 0 ? null : "Please choose a category",
  };

  //check if any of the fields is invalid
  const hasError = Object.values(error).some((v) => v);

  //send filled in user values back to client along with the errors
  if (hasError) {
    return json<ActionData>({ error, values }, { status: 400 });
  }

  //no errors so add expense
  const expense = {
    id: uuid(),
    title,
    amount: new Prisma.Decimal(amount),
    date: new Date(date),
    userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
    categoryId: category,
  };
  await createExpense(expense);

  return redirect("/expenses");
};

export const loader: LoaderFunction = async ({ request }) => {
  const categories = await getCategoriesByUserId("70e0cff2-7589-4de8-9f2f-4e372a5a15f3");

  if (!categories) {
    throw new Response("Categories not found", { status: 404 });
  }

  return json<LoaderData>({ categories });
};

export default function NewExpenseRoute() {
  const { categories } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const transition = useTransition();

  const isAdding = transition?.submission?.formData.get('_action') === 'create';

  return (
    <div className="form-wrapper">
      <Form method="post" className="form">
        <fieldset disabled={isAdding}>
          <div className="form-control">
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" />
          </div>
          {actionData?.error.title && (
            <div className="error">{actionData.error.title}</div>
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
          <div className="form-control">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
          {actionData?.error.date && (
            <div className="error">{actionData.error.date}</div>
          )}
          <div className="form-control">
            <label htmlFor="category">Category</label>
            <select name="category">
              <option value="" style={{ color: "#666", fontWeight: "700" }}>
                Select category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {actionData?.error.category && (
            <div className="error">{actionData.error.category}</div>
          )}
        </fieldset>
        <FormActions redirectTo="/expenses" isAdding={isAdding} shouldDisableSubmit={isAdding}/>
      </Form>
    </div>
  );
}

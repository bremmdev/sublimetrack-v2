import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { useLoaderData, Outlet, useTransition, Link } from "@remix-run/react";
import {
  getBudgetsByUserId,
  type Budget,
} from "~/models/budget.server";
import budgetStyles from "~/styles/budgets.css";
import BudgetItem from "~/components/Budgets/BudgetItem";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

export const links = () => [
  { href: budgetStyles, rel: "stylesheet" },
];

type LoaderData = {
  budgets: Budget[];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "delete") {
    const budgetId = formData.get("budget_id");
    invariant(typeof budgetId === "string", "Budget not found!");

    const budgets = await getBudgetsByUserId(
      "70e0cff2-7589-4de8-9f2f-4e372a5a15f3"
    );

    try {
      //delete the second budget, since the first budget is the budget that has a pending delete on it because of the transaction
      await prisma.$transaction([
        prisma.budget.update({
          where: {
            id: budgets[1].id,
          },
          data: {
            endDate: null,
          },
        }),
        prisma.budget.delete({
          where: {
            id: budgetId,
          },
        }),
      ]);
    } catch (e) {
      return json({ error: "Deleting budget failed" });
    }
  }

  return null;
};

export const loader: LoaderFunction = async () => {
  const budgets = await getBudgetsByUserId(
    "70e0cff2-7589-4de8-9f2f-4e372a5a15f3"
  );
  if (!budgets) {
    throw new Response("Budgets not found", { status: 404 });
  }

  return json<LoaderData>({ budgets });
};

export default function BudgetsRoute() {
  const { budgets } = useLoaderData() as unknown as LoaderData;

  const transition = useTransition();

  if (transition.type === "normalLoad") {
    return <div className="spinner"></div>;
  }

  let budgetsContent;

  if (budgets.length === 0) {
    budgetsContent = <p className="my-2">There are currently no budgets.</p>;
  }

  if (budgets && budgets.length > 0) {
    budgetsContent = (
      <ul className="my-2">
        {budgets.map((budget) => (
          <BudgetItem budget={budget} key={budget.id} />
        ))}
      </ul>
    );
  }

  return (
    <div className="container-constrained">
      <div className="flex">
        <h2>Budgets</h2>
        <Link
          to="new"
          prefetch="intent"
          className="btn btn-primary align-right"
        >
          Add Budget
        </Link>
      </div>
      {/*New Budget outlet */}
      <Outlet />
      <div className="budgets-list flex-column">{budgetsContent}</div>
    </div>
  );
}

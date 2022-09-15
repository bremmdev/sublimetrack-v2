import { useFetcher } from "@remix-run/react";
import type { Budget } from "~/models/budget.server";
import { FiTrash2 } from "react-icons/fi";

type Props = {
  budget: Budget;
};

/*HELPER FUNCTIONS*/

const determineBudgetText = (startDate: Date, endDate: Date | null) => {
  const startMonth = new Date(startDate).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const endMonth = endDate
    ? new Date(endDate).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    : "";

  return `${!endDate ? "From" : ""} ${startMonth} ${
    endDate ? " - " + endMonth : ""
  }`;
};

const BudgetItem = (props: Props) => {
  const { budget } = props;

  const fetcher = useFetcher();

  //useful to prevent user from deleting same item multiple times in a row
  const isDeleting =
    fetcher.submission &&
    fetcher.submission.formData.get("budget_id") === budget.id;

  const isFailedDeletion = fetcher.data?.error;

  const budgetText = determineBudgetText(budget.startDate, budget.endDate);
  const currDate = new Date();
  const isCurrentBudget =
    currDate >= new Date(budget.startDate) &&
    (!budget.endDate || currDate <= new Date(budget.endDate));

  const budgetItemClasses = `${isDeleting ? "hidden" : ""} ${
    isCurrentBudget ? "current" : ""
  }`;

  return (
    <>
      <li className={budgetItemClasses}>
        <div className="budget-date">{budgetText}</div>
        <div className="budget-amount">{Number(budget.amount).toFixed(2)}</div>
        {!isCurrentBudget && (
          <fetcher.Form method="post">
            <button
              type="submit"
              className="btn-invisible"
              disabled={isDeleting}
            >
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="budget_id" value={budget.id} />
              <FiTrash2 className="delete-budget-icon" />
            </button>
          </fetcher.Form>
        )}
      </li>
      {isFailedDeletion && (
        <div className="error centered">{fetcher.data?.error}</div>
      )}
    </>
  );
};

export default BudgetItem;

import { useFetcher } from "@remix-run/react";
import type { ExpenseWithCategory } from "~/models/expense.server";
import { FiTrash2 } from "react-icons/fi";

type Props = {
  expense: ExpenseWithCategory;
  deletable?: boolean;
};

const ExpenseItem = (props: Props) => {
  const { expense, deletable = false } = props;

  const fetcher = useFetcher();

  //prevent user from deleting same item multiple times in a row
  const isDeleting =
    fetcher.submission &&
    fetcher.submission.formData.get("expense_id") === expense.id;

  console.log(fetcher.data?.error);

  const isFailedDeletion = fetcher.data?.error;

  const categoryIndicatorStyles = {
    backgroundColor: expense.Category.color,
  };

  const expenseItemClasses = isDeleting ? "hidden" : "";

  return (
    <>
      <li className={expenseItemClasses}>
        <span
          className="category-indicator"
          style={categoryIndicatorStyles}
        ></span>
        <div className="expense-date">
          {new Date(expense.date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })}
        </div>

        <div className="expense-title-cat">
          <div className="expense-title">{expense.title}</div>
          <div className="expense-category">{expense.Category.name}</div>
        </div>
        <div className="expense-amount">
          {Number(expense.amount).toFixed(2)}
        </div>
        {deletable && (
          <fetcher.Form method="post">
            <button
              type="submit"
              className="btn-invisible"
              disabled={isDeleting}
            >
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="expense_id" value={expense.id} />
              <FiTrash2 className="delete-exp-icon" />
            </button>
          </fetcher.Form>
        )}
      </li>
      {isFailedDeletion && <div className="error centered">{fetcher.data?.error}</div>}
    </>
  );
};

export default ExpenseItem;

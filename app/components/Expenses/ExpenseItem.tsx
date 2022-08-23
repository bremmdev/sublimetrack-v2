import type { ExpenseWithCategory } from "~/models/expense.server";

type Props = {
  expense: ExpenseWithCategory;
};

const ExpenseItem = (props: Props) => {

  const categoryIndicatorStyles = {
    backgroundColor: props.expense.Category.color
  }

  return (
    <>
      <li>
        <span className="category-indicator" style={categoryIndicatorStyles}></span>
        <div className="expense-date">
          {new Date(props.expense.date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })}
        </div>

        <div className="expense-title-cat">
          <div className="expense-title">{props.expense.title}</div>
          <div className="expense-category">{props.expense.Category.name}</div>
        </div>
        <div className="expense-amount">
          {Number(props.expense.amount).toFixed(2)}
        </div>
      </li>
    </>
  );
};

export default ExpenseItem;

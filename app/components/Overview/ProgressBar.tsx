import React from "react";

type Props = {
  budgetAmount: number;
  expenseAmount: number;
};

const ProgressBar = ({ budgetAmount, expenseAmount }: Props) => {
  const budgetAmountFormatted = budgetAmount.toFixed(2);
  const balanceAmountFormatted = (budgetAmount - expenseAmount).toFixed(2);

  //calculate width of inner progressbar to indicate the amount spent
  let spentAmountWidth = (expenseAmount / budgetAmount) * 100;
  if (spentAmountWidth > 100) {
    spentAmountWidth = 100;
  }

  const spentAmountStyles = {
    width: spentAmountWidth + "%",
    borderRadius: spentAmountWidth === 100 ? "0.5em" : "0.5em 0 0 0.5em",
  };

  return (
    <section className="progressbar-container flex-column align-center">
      <h3>{`Budget left: ${balanceAmountFormatted} / ${budgetAmountFormatted}`}</h3>
      <div className="progressbar">
        <div className="progressbar-spent" style={spentAmountStyles}></div>
      </div>
    </section>
  );
};

export default ProgressBar;

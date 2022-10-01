import React from "react";
import { type ExpenseWithCategory } from "~/models/expense.server";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Legend } from "chart.js";
import { useTheme } from "../../utils/theme-context"
import { useContext } from "react";

type Props = {
  expenses: ExpenseWithCategory[];
};

interface categoriesAndColorsObj {
  categories: string[];
  categoryColors: string[];
}

ChartJS.register(ArcElement, Legend);

const getDataFromExpenses = (
  expenses: ExpenseWithCategory[]
): categoriesAndColorsObj => {
  let categories: string[] = [];
  let categoryColors: string[] = [];
  expenses.forEach((exp) => {
    const name = exp.Category.name;
    if (!categories.includes(name)) {
      categories.push(name);
      categoryColors.push(exp.Category.color);
    }
  });
  return { categories, categoryColors };
};

const getExpensesPerCategory = (
  expenses: ExpenseWithCategory[],
  categories: string[]
): number[] => {
  let totalExpensePerCategory: number[] = [];
  categories.forEach((cat) => {
    const sum = expenses
      .filter((exp) => exp.Category.name === cat)
      .reduce((acc, v) => acc + +v.amount, 0);
    totalExpensePerCategory.push(sum);
  });
  return totalExpensePerCategory;
};

const DoughnutChart = (props: Props) => {
  const { expenses } = props;

  const [theme] = useTheme()

  const { categories, categoryColors } = getDataFromExpenses(expenses);
  const expensesPerCategory = getExpensesPerCategory(expenses, categories);

  //options for donut char
  const options = {
    cutout: "60%",
    plugins: {
      legend: {
        labels: {
          color: theme === "dark" ? "white" : "black",
          padding: 12,
          boxWidth: 10,
          usePointStyle: true,
          font: { size: 13 },
        },
      },
    },
  };
  //data for donut chart
  const data = {
    labels: categories,
    datasets: [
      {
        data: expensesPerCategory,
        backgroundColor: categoryColors,
        borderColor: categoryColors,
      },
    ],
  };

  return (
    <div className="doughnut">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;

import React from "react";

import { type ExpenseWithCategory } from "~/models/expense.server";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend,
  Tooltip,
  Title,
} from "chart.js";
import { useTheme } from "../../utils/theme-context"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  expenses: ExpenseWithCategory[];
};

const getExpensesPerMonth = (expenses: ExpenseWithCategory[]): number[] => {
  let expensesPerMonth: number[] = [];
  expenses.forEach((exp) => {
    const monthIndex = new Date(exp.date).getMonth();
    expensesPerMonth[monthIndex] = expensesPerMonth[monthIndex]
      ? expensesPerMonth[monthIndex] + +exp.amount
      : +exp.amount;
  });
  return expensesPerMonth;
};

const BarChart = (props: Props) => {
  const { expenses } = props;

  const [theme] = useTheme();

  const expensesPerMonth = getExpensesPerMonth(expenses);

  const selectedThemeColor = theme === 'dark' ? "white" : 'black'
  //options for chart
  const options = {
    borderRadius: 3,
    plugins: {
      legend: {
        labels: {
          color: selectedThemeColor,
          padding: 8,
          boxWidth: 10,
          usePointStyle: true,
          font: { size: 13 },
        },
      },
    },
    scales: {
      y: {
        ticks: { color: selectedThemeColor, beginAtZero: true },
        grid: { color: "#666" },
      },
      x: {
        ticks: { color: selectedThemeColor },
        grid: { color: "#666" },
      },
    },
  };
  //data for donut chart
  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Expenses per month",
        data: expensesPerMonth,
        backgroundColor: theme === 'dark' ? "#00CCFF" : '#045ffe',
      },
    ],
  };

  return (
    <div className="barchart">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;

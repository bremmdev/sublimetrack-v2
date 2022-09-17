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

//options for chart
const options = {
  borderRadius: 3,
  plugins: {
    legend: {
      labels: {
        color: "white",
        padding: 8,
        boxWidth: 10,
        usePointStyle: true,
        font: { size: 13 },
      },
    },
  },
  scales: {
    y: {
      ticks: { color: "white", beginAtZero: true },
      grid: { color: "#666" },
    },
    x: {
      ticks: { color: "white" },
      grid: { color: "#666" },
    },
  },
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

  const expensesPerMonth = getExpensesPerMonth(expenses);

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
        backgroundColor: "#00ccff",
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

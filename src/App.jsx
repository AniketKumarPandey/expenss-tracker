import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function App() {
  // ---------- STATE (loaded from localStorage) ----------
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // ---------- PERSIST TO localStorage ----------
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // ---------- ADD EXPENSE ----------
  const addExpense = (e) => {
    e.preventDefault();
    if (text.trim() === "" || amount <= 0 || !date) return;

    setExpenses((prev) => [
      ...prev,
      {
        text,
        amount: Number(amount),
        category,
        date
      }
    ]);

    setText("");
    setAmount("");
    setDate("");
  };

  // ---------- DECREMENT ----------
  const decrementExpense = (index) => {
    setExpenses((prev) =>
      prev
        .map((e, i) =>
          i === index
            ? { ...e, amount: Math.max(0, e.amount - 1) }
            : e
        )
        .filter((e) => e.amount > 0)
    );
  };

  // ---------- REMOVE ----------
  const removeExpense = (index) => {
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- MONTH FILTER ----------
  const filteredExpenses = selectedMonth
    ? expenses.filter(
        (e) => e.date.slice(0, 7) === selectedMonth
      )
    : expenses;

  // ---------- TOTAL ----------
  const total = filteredExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  // ---------- ANALYSIS ----------
  const categoryTotals = filteredExpenses.reduce(
    (acc, e) => {
      acc[e.category] =
        (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {}
  );

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#42a5f5",
          "#66bb6a",
          "#ffa726",
          "#ef5350"
        ]
      }
    ]
  };

  return (
    <div className="container">
      <h2>Expense Tracker</h2>

      <div className="balance">
        <h3>
          Total Expense{" "}
          {selectedMonth && `(${selectedMonth})`}
        </h3>
        <p>₹{total}</p>
      </div>

      <form onSubmit={addExpense}>
        <input
          type="text"
          placeholder="Expense name"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Bills</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button>Add Expense</button>
      </form>

      <h4>Filter by Month</h4>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) =>
          setSelectedMonth(e.target.value)
        }
      />

      <ul>
        {filteredExpenses.map((expense, index) => (
          <li key={index}>
            {expense.text} ({expense.category}) – ₹
            {expense.amount}
            <div>
              <button
                onClick={() =>
                  decrementExpense(index)
                }
              >
                -
              </button>
              <button
                onClick={() =>
                  removeExpense(index)
                }
              >
                x
              </button>
            </div>
          </li>
        ))}
      </ul>

      {filteredExpenses.length > 0 && (
        <>
          <h3>Monthly Analysis</h3>
          <Pie data={chartData} />
        </>
      )}
    </div>
  );
}

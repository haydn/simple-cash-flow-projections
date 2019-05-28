import React from "react";
import { useState } from "react";
import { format, parse } from "date-fns";

import { Period, RecurringTransaction } from "./types";
import { PERIODS, aggregateTransactions, createTransaction } from "./utils";
import TransactionInput from "./TransactionInput";
import Graph from "./Graph";

const TransactionSet = ({
  type,
  transactions,
  setTransactions,
  highlighted,
  setHighlighted
}: {
  type: "income" | "expense";
  transactions: Array<RecurringTransaction>;
  setTransactions: (transactions: Array<RecurringTransaction>) => void;
  highlighted: Array<string>;
  setHighlighted: (highlighted: Array<string>) => void;
}) => (
  <>
    {transactions
      .filter(transaction => transaction.type === type)
      .map(transaction => (
        <div
          key={transaction.id}
          style={{
            background: highlighted.includes(transaction.id)
              ? "yellow"
              : "white"
          }}
          onMouseEnter={() => {
            setHighlighted([transaction.id]);
          }}
          onMouseLeave={() => {
            setHighlighted([]);
          }}
        >
          <TransactionInput
            value={transaction}
            onChange={t => {
              setTransactions(
                t
                  ? transactions.map(x => (x.id === transaction.id ? t : x))
                  : transactions.filter(x => x.id !== transaction.id)
              );
            }}
          />
          <hr />
        </div>
      ))}
    <button
      onClick={() => {
        setTransactions([...transactions, createTransaction({ type })]);
      }}
    >
      Add
    </button>
  </>
);

const App = () => {
  const [balance, setBalance] = useState(2520);
  const [startDate, setStartDate] = useState(new Date());
  const [period, setPeriod] = useState<Period>("1-year");
  const [transactions, setTransactions] = useState<Array<RecurringTransaction>>(
    [
      createTransaction({
        amount: 1100,
        description: "Income from client A",
        date: parse("2019-07-22")
      }),
      createTransaction({
        amount: 125,
        description: "Ad revenue",
        repeats: 24,
        frequency: "monthly"
      }),
      createTransaction({
        amount: 450,
        date: parse("2019-05-31"),
        description: "Rent",
        type: "expense",
        repeats: 24,
        frequency: "monthly"
      })
    ]
  );
  const [highlighted, setHighlighted] = useState<Array<string>>([]);
  const aggregatedTransactions = aggregateTransactions(
    startDate,
    period,
    balance,
    transactions
  );
  return (
    <div className="App">
      <h1>Simple Cash Flow Projection</h1>
      <div>
        <label>Starting Balance: $</label>
        <input
          type="number"
          step="any"
          onChange={event => {
            setBalance(parseFloat(event.currentTarget.value));
          }}
          value={balance}
        />
      </div>
      <div>
        <label>Start Date: </label>
        <input
          type="date"
          onChange={event => {
            setStartDate(parse(event.currentTarget.value));
          }}
          value={format(startDate, "YYYY-MM-DD")}
        />
      </div>
      <div>
        <label>Projection Period: </label>
        <select
          onChange={event => {
            setPeriod(event.currentTarget.value);
          }}
          value={period}
        >
          {Object.entries(PERIODS).map(([key, period]) => (
            <option key={key} value={key}>
              {period.label}
            </option>
          ))}
        </select>
      </div>
      <h2>Income</h2>
      <TransactionSet
        type="income"
        transactions={transactions}
        setTransactions={setTransactions}
        highlighted={highlighted}
        setHighlighted={setHighlighted}
      />
      <h2>Expenses</h2>
      <TransactionSet
        type="expense"
        transactions={transactions}
        setTransactions={setTransactions}
        highlighted={highlighted}
        setHighlighted={setHighlighted}
      />
      <h2>Projection</h2>
      <Graph
        aggregatedTransactions={aggregatedTransactions}
        highlighted={highlighted}
        setHighlighted={setHighlighted}
      />
    </div>
  );
};

export default App;

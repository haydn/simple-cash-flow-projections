import React from "react";
import { format, parse } from "date-fns";

import { RecurringTransaction, Frequency } from "./types";
import { FREQUENCIES } from "./utils";

interface Props {
  value: RecurringTransaction;
  onChange: (value: RecurringTransaction | null) => void;
}

const TransactionInput = ({ value: transaction, onChange }: Props) => (
  <div>
    <input
      type="text"
      value={transaction.description}
      placeholder="Description"
      onChange={event => {
        onChange({ ...transaction, description: event.currentTarget.value });
      }}
    />
    {" – $"}
    <input
      type="number"
      step="any"
      value={transaction.amount}
      placeholder="Amount"
      onChange={event => {
        onChange({
          ...transaction,
          amount: parseInt(event.currentTarget.value, 10)
        });
      }}
    />
    <input
      type="range"
      value={transaction.amount}
      min="0"
      max="10000"
      onChange={event => {
        onChange({
          ...transaction,
          amount: parseInt(event.currentTarget.value, 10)
        });
      }}
    />{" "}
    on{" "}
    <input
      type="date"
      step="any"
      value={format(transaction.date, "YYYY-MM-DD")}
      onChange={event => {
        onChange({ ...transaction, date: parse(event.currentTarget.value) });
      }}
    />{" "}
    repeating{" "}
    <select
      onChange={event => {
        onChange({
          ...transaction,
          frequency: event.currentTarget.value as Frequency
        });
      }}
      value={transaction.frequency}
    >
      {Object.entries(FREQUENCIES).map(([key, frequency]) => (
        <option key={key} value={key}>
          {frequency.label}
        </option>
      ))}
    </select>
    {transaction.frequency === "once" ? (
      "."
    ) : (
      <>
        {" "}
        for{" "}
        <input
          type="number"
          step="1"
          value={transaction.repeats}
          placeholder="0"
          onChange={event => {
            onChange({
              ...transaction,
              repeats: parseInt(event.currentTarget.value, 10)
            });
          }}
        />
        <input
          type="range"
          value={transaction.repeats}
          min="0"
          max={356 * 5}
          onChange={event => {
            onChange({
              ...transaction,
              repeats: parseInt(event.currentTarget.value, 10)
            });
          }}
        />{" "}
        times.
      </>
    )}{" "}
    <button
      onClick={() => {
        onChange(null);
      }}
    >
      Remove
    </button>
  </div>
);

export default TransactionInput;

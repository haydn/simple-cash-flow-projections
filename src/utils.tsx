import { v4 as uuid } from "uuid";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isWithinRange,
  isBefore,
  isSameDay,
  isSameWeek,
  isSameMonth
} from "date-fns";

import {
  Bucket,
  Period,
  Frequency,
  AttributedTransaction,
  RecurringTransaction,
  TransactionAggregation
} from "./types";

const MAX_REPEATS = 356 * 10;

export const BUCKETS: Record<
  Bucket,
  {
    label: string;
    increment: (date: Date) => Date;
    compare: (a: Date, b: Date) => boolean;
  }
> = {
  day: {
    label: "Day",
    increment: date => addDays(date, 1),
    compare: (a, b) => isSameDay(a, b)
  },
  week: {
    label: "Week",
    increment: date => addWeeks(date, 1),
    compare: (a, b) => isSameWeek(a, b)
  },
  month: {
    label: "Month",
    increment: date => addMonths(date, 1),
    compare: (a, b) => isSameMonth(a, b)
  }
};

export const PERIODS: Record<
  Period,
  { label: string; bucket: Bucket; increment: (date: Date) => Date }
> = {
  "4-weeks": {
    label: "4 weeks",
    bucket: "day",
    increment: date => addWeeks(date, 4)
  },
  "8-weeks": {
    label: "8 weeks",
    bucket: "day",
    increment: date => addWeeks(date, 8)
  },
  "3-months": {
    label: "3 months",
    bucket: "day",
    increment: date => addMonths(date, 3)
  },
  "6-months": {
    label: "6 months",
    bucket: "week",
    increment: date => addMonths(date, 6)
  },
  "1-year": {
    label: "1 year",
    bucket: "week",
    increment: date => addYears(date, 1)
  },
  "2-years": {
    label: "2 years",
    bucket: "week",
    increment: date => addYears(date, 2)
  },
  "5-years": {
    label: "5 years",
    bucket: "month",
    increment: date => addYears(date, 5)
  }
};

export const FREQUENCIES: Record<
  Frequency,
  { label: string; increment: (date: Date) => Date }
> = {
  once: {
    label: "never",
    increment: date => date
  },
  daily: {
    label: "daily",
    increment: date => addDays(date, 1)
  },
  "every-2-days": {
    label: "every 2 days",
    increment: date => addDays(date, 2)
  },
  "every-3-days": {
    label: "every 3 days",
    increment: date => addDays(date, 3)
  },
  "every-4-days": {
    label: "every 4 days",
    increment: date => addDays(date, 4)
  },
  "every-5-days": {
    label: "every 5 days",
    increment: date => addDays(date, 5)
  },
  "every-6-days": {
    label: "every 6 days",
    increment: date => addDays(date, 6)
  },
  weekly: {
    label: "weekly",
    increment: date => addWeeks(date, 1)
  },
  "every-2-weeks": {
    label: "every 2 weeks",
    increment: date => addWeeks(date, 2)
  },
  "every-3-weeks": {
    label: "every 3 weeks",
    increment: date => addWeeks(date, 3)
  },
  "every-4-weeks": {
    label: "every 4 weeks",
    increment: date => addWeeks(date, 4)
  },
  monthly: {
    label: "monthly",
    increment: date => addMonths(date, 1)
  },
  "every-2-months": {
    label: "every 2 months",
    increment: date => addMonths(date, 2)
  },
  "every-3-months": {
    label: "every 3 months",
    increment: date => addMonths(date, 3)
  },
  "every-6-months": {
    label: "every 6 months",
    increment: date => addMonths(date, 6)
  },
  yearly: {
    label: "yearly",
    increment: date => addYears(date, 1)
  }
};

export const createTransaction = (
  transaction: Partial<RecurringTransaction>
): RecurringTransaction => ({
  id: uuid(),
  type: "income",
  amount: 0,
  date: new Date(),
  frequency: "once",
  repeats: "forever",
  description: "",
  ...transaction
});

const expandTransaction = (
  startDate: Date,
  endDate: Date,
  {
    id,
    type,
    description,
    amount,
    date,
    frequency,
    repeats
  }: RecurringTransaction
): Array<AttributedTransaction> =>
  (isWithinRange(date, startDate, endDate)
    ? [
        {
          id: uuid(),
          type: type,
          description: description,
          amount: amount,
          date: date,
          source: id
        }
      ]
    : []
  ).concat(
    frequency !== "once" && repeats > 0
      ? [
          ...expandTransaction(startDate, endDate, {
            id,
            type,
            description,
            amount,
            date: FREQUENCIES[frequency].increment(date),
            frequency,
            repeats: repeats === "forever" ? MAX_REPEATS : repeats - 1
          })
        ]
      : []
  );

const range = (from: Date, to: Date, bucket: Bucket): Array<Date> => {
  const nextDate = BUCKETS[bucket].increment(from);
  return isBefore(to, nextDate)
    ? [from]
    : [from, ...range(nextDate, to, bucket)];
};

export const aggregateTransactions = (
  startDate: Date,
  period: Period,
  startingBalance: number,
  transactions: Array<RecurringTransaction>
): Array<TransactionAggregation> => {
  const bucket = PERIODS[period].bucket;
  const endDate = PERIODS[period].increment(startDate);
  const expandedTranactions = transactions.reduce(
    (result, transaction) => [
      ...result,
      ...expandTransaction(startDate, endDate, transaction)
    ],
    []
  );
  let balance = startingBalance;
  return range(startDate, endDate, bucket).map(date => {
    const transactions = expandedTranactions.filter(t =>
      BUCKETS[bucket].compare(t.date, date)
    );
    const income = transactions
      .filter(({ type }) => type === "income")
      .reduce((result, { amount }) => result + amount, 0);
    const expenses = transactions
      .filter(({ type }) => type === "expense")
      .reduce((result, { amount }) => result + amount, 0);
    const delta = income - expenses;
    balance += delta;
    return {
      date,
      bucket,
      volume: income + expenses,
      income,
      expenses,
      delta,
      balance,
      source: transactions.map(({ source }) => source)
    };
  });
};

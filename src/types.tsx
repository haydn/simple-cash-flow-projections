export type Bucket = "day" | "week" | "month";

export type Period =
  | "4-weeks"
  | "8-weeks"
  | "3-months"
  | "6-months"
  | "1-year"
  | "2-years"
  | "5-years";

export type Frequency =
  | "once"
  | "daily"
  | "every-2-days"
  | "every-3-days"
  | "every-4-days"
  | "every-5-days"
  | "every-6-days"
  | "weekly"
  | "every-2-weeks"
  | "every-3-weeks"
  | "every-4-weeks"
  | "monthly"
  | "every-2-months"
  | "every-3-months"
  | "every-6-months"
  | "yearly";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: Date;
}

export interface RecurringTransaction extends Transaction {
  frequency: Frequency;
  repeats: number | "forever";
}

export interface AttributedTransaction extends Transaction {
  source: string;
}

export interface TransactionAggregation {
  date: Date;
  bucket: Bucket;
  volume: number;
  income: number;
  expenses: number;
  delta: number;
  balance: number;
  source: Array<string>;
}

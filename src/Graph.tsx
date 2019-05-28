import React from "react";
import { format, isFirstDayOfMonth } from "date-fns";

import { TransactionAggregation } from "./types";

interface Props {
  aggregatedTransactions: Array<TransactionAggregation>;
  highlighted: Array<string>;
  setHighlighted: (highlighted: Array<string>) => void;
}

const range = (min: number, max: number, increment: number): Array<number> => {
  const next = min + increment;
  return next > max ? [min] : [min, ...range(next, max, increment)];
};

const Graph = ({
  aggregatedTransactions,
  highlighted,
  setHighlighted
}: Props) => {
  const width = 1000;
  const height = 300;
  const padding = 50;
  const colWidth = (width - padding) / aggregatedTransactions.length;
  const domainLimit = aggregatedTransactions.reduce(
    (limit, a) => Math.max(Math.abs(a.balance), a.income, a.expenses, limit),
    0
  );
  const increment = 10 ** (domainLimit.toFixed().length - 1);
  return (
    <div
      style={{
        position: "relative",
        paddingBottom: `${(height / width) * 100}%`
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute" }}
      >
        {aggregatedTransactions.map((a, index) => (
          <rect
            key={`${format(a.date, "YYYY-MM-DD")}-background`}
            fill={
              a.source.some(id => highlighted.includes(id)) ? "yellow" : "white"
            }
            x={padding + colWidth * index}
            y={0}
            width={colWidth}
            height={height}
            onMouseEnter={() => {
              // setHighlighted(a.source);
            }}
            onMouseLeave={() => {
              // setHighlighted([]);
            }}
          />
        ))}
        {aggregatedTransactions.map((a, index) => (
          <line
            key={`${format(a.date, "YYYY-MM-DD")}-divider`}
            stroke="#eee"
            x1={padding + colWidth * (index + 1)}
            x2={padding + colWidth * (index + 1)}
            y1="0"
            y2={height}
            style={{ pointerEvents: "none" }}
          />
        ))}
        {aggregatedTransactions.map((a, index) => (
          <g key={`${format(a.date, "YYYY-MM-DD")}-date`}>
            {a.bucket === "day" ? (
              <>
                {index === 0 || isFirstDayOfMonth(a.date) ? (
                  <text
                    fontSize="10px"
                    x={padding + colWidth * index + 5}
                    y="10"
                    fill="#ccc"
                  >
                    {format(a.date, "MMMM YYYY")}
                  </text>
                ) : null}
                <text
                  fontSize="10px"
                  x={padding + colWidth * index + 5}
                  y="20"
                  fill="#ccc"
                >
                  {format(a.date, "D")}
                </text>
              </>
            ) : null}
          </g>
        ))}
        {range(0, domainLimit, increment).map(amount => (
          <text
            fontSize="10px"
            textAnchor="end"
            x={padding - 5}
            y={height / 2 - ((amount / domainLimit) * (height - padding)) / 2}
            fill="#ccc"
          >
            ${amount}
          </text>
        ))}
        {aggregatedTransactions.map((a, index) => (
          <rect
            key={`${format(a.date, "YYYY-MM-DD")}-income`}
            fill="#99cc99"
            x={padding + colWidth / 4 + colWidth * index}
            y={height / 2 - ((a.income / domainLimit) * (height - padding)) / 2}
            width={colWidth / 2}
            height={((a.income / domainLimit) * (height - padding)) / 2}
            style={{ pointerEvents: "none" }}
          />
        ))}
        {aggregatedTransactions.map((a, index) => (
          <rect
            key={`${format(a.date, "YYYY-MM-DD")}-expenses`}
            fill="#fc9999"
            x={padding + colWidth / 4 + colWidth * index}
            y={height / 2}
            width={colWidth / 2}
            height={((a.expenses / domainLimit) * (height - padding)) / 2}
            style={{ pointerEvents: "none" }}
          />
        ))}
        <line
          stroke="black"
          x1={padding}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          style={{ pointerEvents: "none" }}
        />
        <line
          stroke="black"
          x1={padding}
          y1="0"
          x2={padding}
          y2={height}
          style={{ pointerEvents: "none" }}
        />
        {aggregatedTransactions
          .reduce(
            (result, a, index, original) =>
              index === 0
                ? []
                : [...result, [original[index - 1].balance, a.balance]],
            []
          )
          .map(([a, b], index) => (
            <line
              stroke={a > 0 && b > 0 ? "black" : "red"}
              x1={padding + colWidth * index + colWidth / 2}
              y1={height / 2 - ((a / domainLimit) * (height - padding)) / 2}
              x2={padding + colWidth * (index + 1) + colWidth / 2}
              y2={height / 2 - ((b / domainLimit) * (height - padding)) / 2}
              style={{ pointerEvents: "none" }}
            />
          ))}
        {aggregatedTransactions.map((a, index) => (
          <circle
            key={`${format(a.date, "YYYY-MM-DD")}-point`}
            fill={a.balance > 0 ? "black" : "red"}
            cx={padding + colWidth * index + colWidth / 2}
            cy={
              height / 2 - ((a.balance / domainLimit) * (height - padding)) / 2
            }
            r="1.5"
            style={{ pointerEvents: "none" }}
          />
        ))}
      </svg>
    </div>
  );
};

export default Graph;

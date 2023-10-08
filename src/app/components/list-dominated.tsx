import * as React from "react";
import { Datum, getDominatedPairs } from "../utils";

export function ListDominated({ data }: { data: Datum[] }) {
  const dominatedPairs = getDominatedPairs(data);
  return (
    <div>
      <h2 className="mb-3 text-xl">Which models are dominated?</h2>
      <ul className="list-disc list-inside">
        {dominatedPairs.length > 0
          ? dominatedPairs.map(([datum1, datum2], index) => (
              <li key={index}>
                {datum2.model} is dominated by {datum1.model}
              </li>
            ))
          : "No models are dominated."}
      </ul>
    </div>
  );
}

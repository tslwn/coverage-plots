import * as React from "react";
import { Datum, capitalize, getConvexHull, getDominatedPairs } from "../utils";

// This depends on `getConvexHull` returning the points in order of increasing x.
function getPreferredPairs(convexHull: Datum[]): [Datum, Datum, number][] {
  const results: [Datum, Datum, number][] = [];
  for (let index = 0; index < convexHull.length - 1; index++) {
    const datum1 = convexHull[index];
    const datum2 = convexHull[index + 1];
    const slope = (datum2.y - datum1.y) / (datum2.x - datum1.x);
    results.push([datum1, datum2, slope]);
  }
  return results;
}

export function ListAccuracy({ data }: { data: Datum[] }) {
  const preferredPairs = getPreferredPairs(getConvexHull(data));
  return (
    <div>
      <h2 className="mb-3 text-xl">When do models have greater accuracy?</h2>
      <ul className="list-disc list-inside">
        {preferredPairs.map(([datum1, datum2, slope], index) => (
          <li key={index}>
            {capitalize(datum2.model)} is preferred to {datum1.model} when the
            class ratio ≥ {slope.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

import * as React from "react";
import { Datum, capitalize, getConvexHull, round } from "../utils";

// This depends on `getConvexHull` returning the points in order of increasing x.
function getPreferredPairs(convexHull: Datum[]): [Datum, Datum, number][] {
  const results: [Datum, Datum, number][] = [];
  let result: [Datum, Datum, number] | undefined;
  let slopePrev: number | undefined;
  for (let index = 0; index < convexHull.length - 1; index++) {
    const datum1 = convexHull[index];
    const datum2 = convexHull[index + 1];
    const slope = round((datum2.y - datum1.y) / (datum2.x - datum1.x));
    // If the slope is the same as the previous slope, extend the previous result.
    if (result !== undefined && slope === slopePrev) {
      result![1] = datum2;
    } else {
      // If there is a previous result, add it to the array.
      if (result !== undefined) {
        results.push(result);
      }
      // Start a new result and set the previous slope.
      result = [datum1, datum2, slope];
      slopePrev = slope;
    }
    // If this is the last point, add the result to the array.
    if (index === convexHull.length - 2) {
      results.push(result);
    }
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

import * as React from "react";
import { Datum, list, round } from "../utils";

function getAverageRecallGroups(
  scatterData: Datum[]
): { averageRecall: number; models: string[] }[] {
  const averageRecalls = scatterData.map((datum) => ({
    model: datum.model,
    averageRecall: round((datum.y + (1 - datum.x)) / 2),
  }));
  const results: { averageRecall: number; models: string[] }[] = [];
  for (const { model, averageRecall } of averageRecalls) {
    const result = results.find(
      (result) => result.averageRecall === averageRecall
    );
    if (result !== undefined) {
      result.models.push(model);
    } else {
      results.push({ averageRecall, models: [model] });
    }
  }
  return results.filter((result) => result.models.length > 1);
}

export function ListAverageRecall({ data }: { data: Datum[] }) {
  const averageRecallPairs = getAverageRecallGroups(data);
  return (
    <div>
      <h2 className="mb-3 text-xl">
        Which models have the same average recall?
      </h2>
      <ul className="list-disc list-inside">
        {averageRecallPairs.length > 0
          ? averageRecallPairs.map(({ averageRecall, models }, index) => (
              <li key={index}>
                {list(models)} have average recall{" "}
                {averageRecall.toLocaleString()}
              </li>
            ))
          : "No models have the same average recall."}
      </ul>
    </div>
  );
}

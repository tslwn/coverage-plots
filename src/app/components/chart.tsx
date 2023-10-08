"use client";

import React from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryChartProps,
  VictoryLine,
  VictoryScatter,
} from "victory";

import { Datum, getConvexHull } from "../utils";

const fontFamily = "Inter";

const labelsStyle = {
  fontFamily,
  fontSize: 12,
};

const chart: VictoryChartProps = {
  domain: { x: [0, 1], y: [0, 1] },
  height: 500,
  width: 500,
};

const axis = {
  tickValues: Array.from({ length: 11 }).map((_, index) => index / 10),
  style: {
    axisLabel: { fontFamily, fontSize: 14, padding: 32 },
    grid: {
      stroke: ({ tick }: { tick: number }) => tick !== 0 && "lightgray",
    },
    tickLabels: { fontFamily, fontSize: 12, padding: 6 },
  },
};

const line = {
  labels: ({ datum }: { datum: Datum }) =>
    datum.x === 1 ? "Convex hull" : null,
  style: {
    data: { stroke: "gray", strokeWidth: 1 },
    labels: labelsStyle,
  },
};

const scatter = {
  labels: ({ datum }: { datum: Datum }) => datum.model,
  style: { labels: labelsStyle },
};

type Props = {
  data: Datum[];
};

export function Chart({ data }: Props): JSX.Element {
  const convexHull = getConvexHull(data);
  return (
    <VictoryChart {...chart}>
      <VictoryAxis label="False positive rate" {...axis} />
      <VictoryAxis label="True positive rate" dependentAxis {...axis} />
      <VictoryLine data={convexHull} {...line} />
      <VictoryScatter data={data} {...scatter} />
    </VictoryChart>
  );
}

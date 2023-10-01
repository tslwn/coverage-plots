"use client";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/table/lib/css/table.css";

import { Intent } from "@blueprintjs/core";
import {
  Column,
  ColumnHeaderCell,
  EditableCell2,
  Table2,
} from "@blueprintjs/table";
import React from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
} from "victory";

const columnNames = ["Model", "True positive rate", "False positive rate"];

// TODO: handle/disallow duplicate model names
type Datum = { model: string; x: number; y: number };

const labelsStyle = {
  fontFamily: "Inter",
  fontSize: 12,
};

const tickValues = Array.from({ length: 11 }).map((_, index) => index / 10);

const axisStyle = {
  axisLabel: { fontFamily: "Inter", fontSize: 14, padding: 32 },
  grid: {
    stroke: ({ tick }: { tick: number }) => tick !== 0 && "lightgray",
  },
  tickLabels: { fontFamily: "Inter", fontSize: 12, padding: 6 },
};

type DataKey = `${number}-${number}`;

function getDataKey(rowIndex: number, columnIndex: number): DataKey {
  return `${rowIndex}-${columnIndex}`;
}

function isValidValue(value: string) {
  return parseFloat(value) >= 0 && parseFloat(value) <= 1;
}

function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1);
}

export default function Home() {
  // TODO: show derivative measures
  const [cellData, setCellData] = React.useState<Record<DataKey, string>>({
    "0-0": "1",
    "0-1": "0.8",
    "0-2": "0.4",
    "1-0": "2",
    "1-1": "0.4",
    "1-2": "0.2",
    "2-0": "3",
    "2-1": "0.7",
    "2-2": "0.2",
    "3-0": "4",
    "3-1": "0.5",
    "3-2": "0.1",
    "4-0": "5",
    "4-1": "0.9",
    "4-2": "0.3",
  });

  // TODO: don't draw plot if invalid values
  const [cellIntent, setCellIntent] = React.useState<Record<DataKey, Intent>>(
    {}
  );

  const columnHeaderCellRenderer = (columnIndex: number) => {
    return <ColumnHeaderCell name={columnNames[columnIndex]} />;
  };

  const handleValidate = (
    value: string,
    rowIndex: number | undefined,
    columnIndex: number | undefined
  ) => {
    if (rowIndex == undefined || columnIndex == undefined) {
      return;
    }
    const dataKey = getDataKey(rowIndex, columnIndex);
    if (columnIndex !== 0) {
      setCellIntent((prev) => ({
        ...prev,
        [dataKey]: isValidValue(value) ? null : Intent.DANGER,
      }));
    }
    setCellData((prev) => ({
      ...prev,
      [dataKey]: value,
    }));
  };

  const cellRenderer = (rowIndex: number, columnIndex: number) => {
    const dataKey = getDataKey(rowIndex, columnIndex);
    const value = cellData[dataKey];
    return (
      <EditableCell2
        rowIndex={rowIndex}
        columnIndex={columnIndex}
        value={value == null ? "" : value}
        intent={cellIntent[dataKey]}
        onCancel={handleValidate}
        onChange={handleValidate}
        onConfirm={handleValidate}
      />
    );
  };

  const scatterData = getScatterData(cellData);
  const dominatedPairs = getDominatedPairs(scatterData);
  const convexHull = getConvexHull(scatterData);
  const preferredPairs = getPreferredPairs(getConvexHull(scatterData));

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl">Normalized coverage (ROC) plot</h1>
      <div className="flex gap-x-8">
        <div className="flex flex-col gap-y-16">
          <div>
            <h2 className="mb-4 text-xl">Models</h2>
            {/* TODO: allow adding/removing rows */}
            <Table2
              numRows={numRows(cellData)}
              cellRendererDependencies={[cellData, cellIntent]}
            >
              {columnNames.map((_, index) => (
                <Column
                  key={index}
                  cellRenderer={cellRenderer}
                  columnHeaderCellRenderer={columnHeaderCellRenderer}
                />
              ))}
            </Table2>
          </div>
          <div>
            <h2 className="mb-4 text-xl">Which models are dominated?</h2>
            <ul className="list-disc list-inside mb-4">
              {dominatedPairs.map(([datum1, datum2], index) => (
                <li key={index}>
                  {datum2.model} is dominated by {datum1.model}
                </li>
              ))}
            </ul>
            <h2 className="mb-4 text-xl">
              When do models have greater accuracy?
            </h2>
            <ul className="list-disc list-inside">
              {preferredPairs.map(([datum1, datum2, slope], index) => (
                <li key={index}>
                  {capitalize(datum2.model)} is preferred to {datum1.model} when
                  the class ratio ≥ {slope.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h2 className="text-xl">Plot</h2>
          <VictoryChart
            domain={{ x: [0, 1], y: [0, 1] }}
            height={500}
            width={500}
          >
            <VictoryAxis
              label="False positive rate"
              tickValues={tickValues}
              style={axisStyle}
            />
            <VictoryAxis
              label="True positive rate"
              tickValues={tickValues}
              style={axisStyle}
              dependentAxis
            />
            <VictoryLine
              data={convexHull}
              labels={({ datum }: { datum: Datum }) =>
                datum.x === 1 ? "Convex hull" : null
              }
              style={{
                data: { stroke: "gray", strokeWidth: 1 },
                labels: labelsStyle,
              }}
            />
            <VictoryScatter
              data={scatterData}
              labels={({ datum }: { datum: Datum }) => datum.model}
              style={{ labels: labelsStyle }}
            />
          </VictoryChart>
        </div>
      </div>
    </div>
  );
}

function numRows(data: Record<DataKey, string>): number {
  let result = 0;
  for (const key of Object.keys(data)) {
    const [rowIndex] = key.split("-").map(parseInt);
    result = Math.max(result, rowIndex + 1);
  }
  return result;
}

function getScatterData(data: Record<DataKey, string>): Datum[] {
  const result: Datum[] = Array.from({
    length: numRows(data),
  });
  for (const [key, value] of Object.entries(data)) {
    const [rowIndex, columnIndex] = key.split("-").map((x) => parseInt(x));
    if (result[rowIndex] === undefined) {
      result[rowIndex] = { model: "", x: 0, y: 0 };
    }
    switch (columnIndex) {
      case 0:
        result[rowIndex].model = value;
      case 1:
        result[rowIndex].y = parseFloat(value);
      case 2:
        result[rowIndex].x = parseFloat(value);
    }
  }
  return result;
}

function pairs(scatterData: Datum[]): [Datum, Datum][] {
  const result: [Datum, Datum][] = [];
  for (const datum1 of scatterData) {
    for (const datum2 of scatterData) {
      if (datum1.model !== datum2.model) {
        result.push([datum1, datum2]);
      }
    }
  }
  return result;
}

function isDominated(datum1: Datum, datum2: Datum): boolean {
  return datum1.x <= datum2.x && datum1.y >= datum2.y;
}

function getDominatedPairs(scatterData: Datum[]): [Datum, Datum][] {
  return pairs(scatterData)
    .filter(([datum1, datum2]) => isDominated(datum1, datum2))
    .sort(([, datum1], [, datum2]) => datum1.model.localeCompare(datum2.model));
}

function getConvexHull(scatterData: Datum[]): Datum[] {
  const dominatedPairs = getDominatedPairs(scatterData);
  return [
    { model: "always positive", x: 1, y: 1 },
    { model: "always negative", x: 0, y: 0 },
  ]
    .concat(
      scatterData.filter(
        (datum) => !dominatedPairs.some(([_, datum2]) => datum === datum2)
      )
    )
    .sort((a, b) => a.x - b.x);
}

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

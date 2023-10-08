"use client";

import React from "react";

import { Chart } from "./components/chart";
import { ListDominated } from "./components/list-dominated";
import { ListAccuracy } from "./components/list-accuracy";
import { ListAverageRecall } from "./components/list-average-recall";
import { Table } from "./components/table";
import { CellData, getChartData, INITIAL_CELL_DATA } from "./utils";

export default function Home(): JSX.Element {
  const [cellData, setCellData] = React.useState<CellData>(INITIAL_CELL_DATA);
  const chartData = getChartData(cellData);
  return (
    <div className="p-6">
      <h1 className="mb-3 text-2xl">Normalized coverage (ROC) plot</h1>
      <div className="flex gap-x-16">
        <div className="flex flex-col gap-y-16">
          <div>
            <h2 className="mb-3 text-xl">Models</h2>
            <Table data={cellData} onChangeData={setCellData} />
          </div>
          <div>
            <Chart data={chartData} />
          </div>
        </div>
        <div>
          <div className="flex flex-col gap-y-6">
            <ListDominated data={chartData} />
            <ListAccuracy data={chartData} />
            <ListAverageRecall data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
}

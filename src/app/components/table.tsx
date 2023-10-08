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
import { CellData, DataKey, numRows } from "../utils";

const columns = ["Model", "True positive rate", "False positive rate"];

const columnHeaderCellRenderer = (columnIndex: number) => {
  return <ColumnHeaderCell name={columns[columnIndex]} />;
};

function getDataKey(rowIndex: number, columnIndex: number): DataKey {
  return `${rowIndex}-${columnIndex}`;
}

function isValidValue(value: string): boolean {
  return parseFloat(value) >= 0 && parseFloat(value) <= 1;
}

type Props = {
  data: CellData;
  onChangeData: (cellData: CellData) => void;
};

export function Table({ data, onChangeData }: Props): JSX.Element {
  const [intent, setIntent] = React.useState<Record<DataKey, Intent>>({});

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
      setIntent((prev) => ({
        ...prev,
        [dataKey]: isValidValue(value) ? null : Intent.DANGER,
      }));
    }
    onChangeData({
      ...data,
      [dataKey]: value,
    });
  };

  const cellRenderer = (rowIndex: number, columnIndex: number) => {
    const dataKey = getDataKey(rowIndex, columnIndex);
    const value = data[dataKey];
    return (
      <EditableCell2
        rowIndex={rowIndex}
        columnIndex={columnIndex}
        value={value == null ? "" : value}
        intent={intent[dataKey]}
        onCancel={handleValidate}
        onChange={handleValidate}
        onConfirm={handleValidate}
      />
    );
  };

  return (
    <Table2 numRows={numRows(data)} cellRendererDependencies={[data, intent]}>
      {columns.map((_, index) => (
        <Column
          key={index}
          cellRenderer={cellRenderer}
          columnHeaderCellRenderer={columnHeaderCellRenderer}
        />
      ))}
    </Table2>
  );
}

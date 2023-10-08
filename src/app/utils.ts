export type DataKey = `${number}-${number}`;

export type CellData = Record<DataKey, string>;

export const INITIAL_CELL_DATA: CellData = {
  "0-0": "1",
  "0-1": "0.6",
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
};

export type Datum = { model: string; x: number; y: number };

const DEFAULT_DATA: Datum[] = [
  { model: "always positive", x: 1, y: 1 },
  { model: "always negative", x: 0, y: 0 },
];

export function capitalize(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}

export function list(values: string[]): string {
  switch (values.length) {
    case 0:
      return "";
    case 1:
      return capitalize(values[0]);
    case 2:
      return capitalize(values[0]) + " and " + values[1];
    default:
      return (
        values
          .slice(0, -1)
          .map((value, index) => (index === 0 ? capitalize(value) : value))
          .join(", ") +
        " and " +
        values.slice(-1)
      );
  }
}

export function round(value: number, decimals = 3): number {
  return Number(
    Math.round(
      Number(value.toString() + "e" + decimals.toString())
    ).toString() +
      "e-" +
      decimals.toString()
  );
}

export function numRows(data: CellData): number {
  let result = 0;
  for (const key of Object.keys(data)) {
    const [rowIndex] = key.split("-").map(parseInt);
    result = Math.max(result, rowIndex + 1);
  }
  return result;
}

export function getChartData(data: CellData): Datum[] {
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

export function pairs(data: Datum[]): [Datum, Datum][] {
  const result: [Datum, Datum][] = [];
  for (const datum1 of data) {
    for (const datum2 of data) {
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

export function getDominatedPairs(data: Datum[]): [Datum, Datum][] {
  return pairs(data)
    .filter(([datum1, datum2]) => isDominated(datum1, datum2))
    .sort(([, datum1], [, datum2]) => datum1.model.localeCompare(datum2.model));
}

export function getConvexHull(data: Datum[]): Datum[] {
  const dominatedPairs = getDominatedPairs(data);
  return DEFAULT_DATA.concat(
    data.filter(
      (datum) => !dominatedPairs.some(([_, datum2]) => datum === datum2)
    )
  ).sort((a, b) => a.x - b.x);
}

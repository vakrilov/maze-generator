import React, { FC } from "react";
import cx from "classnames";
import {
  CellInfo,
  Direction,
  Directions,
} from "./maze-generator";


import "./App.css";
const directionToAngleMap = {
  [Direction.up]: "0deg",
  [Direction.right]: "90deg",
  [Direction.down]: "180deg",
  [Direction.left]: "270deg",
};
const directionToAngle = (d: Direction) => directionToAngleMap[d];

type ShowPaths = "none" | "main" | "all";

const MazeCell: FC<{
  cell: CellInfo;
  row: number;
  col: number;
  showPaths: ShowPaths;
}> = ({ cell, row, col, showPaths }) => {
  const borders = Directions.filter(
    (d) => !(cell.mainRoute & d) && !(cell.fakeRoute & d)
  );

  return (
    <div
      className={cx(
        "cell",
        showPaths !== "none" && cell.taken && "taken",
        showPaths !== "none" && cell.candidate && "candidate"
      )}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
      }}
    >
      {cell.taken &&
        borders.map((d) => (
          <div key={d} className={cx("walls", Direction[d] + "-border")} />
        ))}

      {showPaths === "all" &&
        Directions.filter((d) => d & cell.fakeRoute).map((d, i) => (
          <div
            key={"fake" + d}
            className="line-fake"
            style={{
              "--rotate": directionToAngle(d),
            }}
          ></div>
        ))}

      {(showPaths === "main" || showPaths === "all") &&
        Directions.filter((d) => d & cell.mainRoute).map((d) => (
          <div
            key={"main" + d}
            className="line"
            style={{
              "--rotate": directionToAngle(d),
            }}
          ></div>
        ))}
    </div>
  );
};

export default MazeCell;
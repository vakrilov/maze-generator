import React, { FC, useEffect, useState } from "react";
import cx from "classnames";
import {
  CellInfo,
  maze,
  generateMaze,
  Direction,
} from "./maze-generator";

import "./App.css";

const directionToAngleMap = {
  [Direction.up]: "0deg",
  [Direction.right]: "90deg",
  [Direction.down]: "180deg",
  [Direction.left]: "270deg",
};
const directionToAngle = (d: Direction) => directionToAngleMap[d];

const Cell: FC<{ cell: CellInfo; row: number; col: number }> = ({
  cell,
  row,
  col,
}) => {
  return (
    <div
      className={cx("cell", cell.taken && "taken")}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
      }}
    >
      {cell.mainRoute.map((d) => (
        <div
          className="line"
          style={{
            "--rotate": directionToAngle(d),
          }}
        ></div>
      ))}
    </div>
  );
};

function App() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const increment = () => setStep((v) => v + 1);
    generateMaze(increment);
  }, []);

  return (
    <div className="App">
      <div className="container">
        {maze.map((col, colIdx) => (
          <>
            {col.map((cell, rowIdx) => (
              <Cell row={rowIdx} col={colIdx} cell={cell}></Cell>
            ))}
            <div className="break" />
          </>
        ))}
      </div>
      STEP: {step}
    </div>
  );
}

export default App;

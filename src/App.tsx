import React, { FC, useEffect, useState } from "react";
import cx from "classnames";
import {
  CellInfo,
  maze,
  generateMaze,
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

const Cell: FC<{ cell: CellInfo; row: number; col: number }> = ({
  cell,
  row,
  col,
}) => {
  const borders = Directions.filter(
    (d) => !(cell.mainRoute & d) && !(cell.fakeRoute & d)
  );

  return (
    <div
      className={cx(
        "cell",
        cell.taken && "taken",
        cell.candidate && "candidate"
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

      {Directions.filter((d) => d & cell.mainRoute).map((d) => (
        <div
          key={"main" + d}
          className="line"
          style={{
            "--rotate": directionToAngle(d),
          }}
        ></div>
      ))}
      {Directions.filter((d) => d & cell.fakeRoute).map((d, i) => (
        <div
          key={"fake" + d}
          className="line-fake"
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
        {maze.map((col, colIdx) =>
          col.map((cell, rowIdx) => (
            <Cell
              key={colIdx + ", " + rowIdx}
              row={rowIdx}
              col={colIdx}
              cell={cell}
            ></Cell>
          ))
        )}
      </div>
      STEP: {step}
    </div>
  );
}

export default App;

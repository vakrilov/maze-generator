import React, { FC, useEffect, useState } from "react";
import cx from "classnames";
import { CellInfo, maze, startGenerating } from "./maze-generator";

import "./App.css";

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
      {cell.taken && cell.next && (
        <div
          className="line"
          style={{
            "--rotate": Math.log2(cell.next!) * 90 + "deg",
          }}
        ></div>
      )}
      {cell.taken && cell.prev && (
        <div
          className="line"
          style={{
            "--rotate": Math.log2(cell.prev!) * 90 + 180 + "deg",
          }}
        ></div>
      )}
    </div>
  );
};

function App() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const increment = () => setStep((v) => v + 1);
    startGenerating(increment);
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
function generatePath(
  arg0: { x: number; y: number },
  arg1: { x: number; y: number },
  down: any
): any {
  throw new Error("Function not implemented.");
}

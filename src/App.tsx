import React, { FC, useEffect, useState } from "react";
import cx from "classnames";
import {
  CellInfo,
  generateMaze,
  Direction,
  Directions,
} from "./maze-generator";

import "./App.css";
import { Slider, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";

const directionToAngleMap = {
  [Direction.up]: "0deg",
  [Direction.right]: "90deg",
  [Direction.down]: "180deg",
  [Direction.left]: "270deg",
};
const directionToAngle = (d: Direction) => directionToAngleMap[d];

type ShowPaths = "none" | "main" | "all";

const Cell: FC<{
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

function App() {
  const [snapshots] = useState(generateMaze);
  const [step, setStep] = useState(0);
  const [showPaths, setShowPaths] = React.useState<ShowPaths>("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => {
        if (s < snapshots.length - 1) {
          return s + 1;
        } else {
          clearTimeout(timer);
          return s;
        }
      });
    }, 30);

    return () => {
      clearTimeout(timer);
    };
  }, [snapshots.length]);

  const stepChange = (event: Event, newValue: number | number[]) => {
    setStep(newValue as number);
  };

  const pathsChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: ShowPaths | null
  ) => {
    if (newValue) {
      setShowPaths(newValue);
    }
  };

  return (
    <div className="App">
      <Stack spacing={2} sx={{ mb: 1 }} alignItems="center" margin={10}>
        <h1>Maze Generator</h1>
        <div className="container">
          {snapshots[step].map((col, colIdx) =>
            col.map((cell, rowIdx) => {
              return (
                <Cell
                  key={colIdx + ", " + rowIdx}
                  row={rowIdx}
                  col={colIdx}
                  cell={cell}
                  showPaths={showPaths}
                ></Cell>
              );
            })
          )}
        </div>
        <Stack
          direction="row"
          spacing={2}
          alignSelf="stretch"
          alignItems="center"
        >
          <h3>Steps: </h3>
          <Slider
            value={step}
            onChange={stepChange}
            min={0}
            max={snapshots.length - 1}
            valueLabelDisplay="auto"
          />
        </Stack>

        <ToggleButtonGroup value={showPaths} onChange={pathsChange} exclusive>
          <ToggleButton value="none" aria-label="show correct path">
            No Paths
          </ToggleButton>
          <ToggleButton value="main" aria-label="show correct path">
            Correct Path
          </ToggleButton>
          <ToggleButton value="all" aria-label="show all paths">
            All Paths
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </div>
  );
}

export default App;

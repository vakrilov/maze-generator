import React, { useCallback, useEffect, useState } from "react";
import { generateMaze, Maze } from "./maze-generator";
import MazeCell from "./MazeCell";

import {
  Button,
  Divider,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2"; // Grid version 2
import { IconButton } from "@mui/material";
import PlayIcon from "@mui/icons-material/PlayCircle";
import PauseIcon from "@mui/icons-material/PauseCircle";

import "./App.css";
const AutoplayInterval = 20;
type ShowPaths = "none" | "main" | "all";

function App() {
  const [size, setSize] = useState(15);
  const [snapshots, setSnapshots] = useState<Maze[]>();
  const [step, setStep] = useState(0);
  const [showPaths, setShowPaths] = React.useState<ShowPaths>("all");
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!snapshots) {
      return;
    }
    if (step >= snapshots.length - 1) {
      setAutoplay(false);
    }

    if (!autoplay || step >= snapshots.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setStep(step + 1);
    }, AutoplayInterval);

    return () => {
      clearTimeout(timer);
    };
  }, [snapshots, step, autoplay]);

  const stepChange = useCallback((_: Event, newValue: number | number[]) => {
    setAutoplay(false);
    setStep(newValue as number);
  }, []);

  const pathsChange = useCallback(
    (_: React.MouseEvent, newValue: ShowPaths | null) => {
      if (newValue) {
        setShowPaths(newValue);
      }
    },
    []
  );

  const sizeChange = useCallback(
    (_: React.MouseEvent, newValue: number | null) => {
      if (newValue) {
        setSize(newValue);
      }
    },
    []
  );

  const toggleAutoplay = useCallback(() => {
    if (snapshots && snapshots[0].length === step) {
      setStep(0);
    }
    setAutoplay(!autoplay);
  }, [step, snapshots, autoplay]);

  const generateMazeHandler = useCallback(() => {
    setStep(0);
    setAutoplay(true);
    setSnapshots(generateMaze(size));
  }, [size]);

  return (
    <Grid2 spacing={2} container margin={4} columns={3}>
      <Grid2 xs={3} lg={1}>
        <h1>Maze Generator</h1>
      </Grid2>
      <Grid2 xs={0} lg={2}></Grid2>

      <Grid2 xs={3} lg={1}>
        <Stack spacing={2} alignItems="center" className="controls">
          <ToggleButtonGroup
            value={size}
            onChange={sizeChange}
            className="controls"
            exclusive
          >
            <ToggleButton value={5}>5x5</ToggleButton>
            <ToggleButton value={9}>9x9</ToggleButton>
            <ToggleButton value={15}>15x15</ToggleButton>
            <ToggleButton value={21}>21x21</ToggleButton>
          </ToggleButtonGroup>

          <Button variant="contained" onClick={generateMazeHandler}>
            generate
          </Button>
          <Divider flexItem />
          {snapshots && (
            <>
              <IconButton onClick={toggleAutoplay}>
                {autoplay ? (
                  <PauseIcon sx={{ fontSize: 80 }} color="primary" />
                ) : (
                  <PlayIcon sx={{ fontSize: 80 }} color="primary" />
                )}
              </IconButton>
              <Slider
                value={step}
                onChange={stepChange}
                min={0}
                max={snapshots.length - 1}
                valueLabelDisplay="auto"
              />

              <span>
                Step: <b>{step}</b>{" "}
              </span>

              <ToggleButtonGroup
                value={showPaths}
                onChange={pathsChange}
                className="controls"
                exclusive
              >
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
            </>
          )}
        </Stack>
      </Grid2>

      <Grid2 xs={3} lg={2}>
        <div className="container">
          {snapshots &&
            snapshots[step].map((col, colIdx) =>
              col.map((cell, rowIdx) => {
                return (
                  <MazeCell
                    key={colIdx + ", " + rowIdx}
                    row={rowIdx}
                    col={colIdx}
                    cell={cell}
                    showPaths={showPaths}
                  ></MazeCell>
                );
              })
            )}
        </div>
      </Grid2>
    </Grid2>
  );
}

export default App;

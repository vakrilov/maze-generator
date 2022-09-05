/* eslint-disable no-loop-func */
// const N = 21;
export enum Direction {
  none = 0,
  up = 1 << 0,
  down = 1 << 1,
  right = 1 << 2,
  left = 1 << 3,
}

export const Directions = [
  Direction.up,
  Direction.right,
  Direction.down,
  Direction.left,
] as const;

const reverseDirectionMap = {
  [Direction.up]: Direction.down,
  [Direction.right]: Direction.left,
  [Direction.down]: Direction.up,
  [Direction.left]: Direction.right,
};
export const reverse = (d: Direction) => reverseDirectionMap[d];

type Point = {
  x: number;
  y: number;
};

export type CellInfo = {
  taken: boolean;
  candidate: boolean;
  mainRoute: Direction;
  fakeRoute: Direction;
};

const isSolvable = (maze: CellInfo[][], start: Point, end: Point): boolean => {
  const N = maze.length;
  const queue: Point[] = [start];

  const visited: boolean[] = new Array(N * N).fill(false);

  while (queue.length && queue.length < N * N) {
    const current = queue.shift() as Point;
    if (current.x === end.x && current.y === end.y) {
      return true;
    }
    if (!visited[current.x * N + current.y]) {
      visited[current.x * N + current.y] = true;
      const candidates = Directions.map((dir) =>
        goInDirection(current, dir)
      ).filter((p) => isFree(maze, p) && !visited[p.x * N + p.y]);
      queue.push(...candidates);
    }
  }

  return false;
};

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const goInDirection = (p: Point, d: Direction) => {
  const res = { ...p };
  res.y += d & Direction.down ? 1 : 0;
  res.y += d & Direction.up ? -1 : 0;
  res.x += d & Direction.right ? 1 : 0;
  res.x += d & Direction.left ? -1 : 0;
  return res;
};

const isFree = (maze: CellInfo[][], { x, y }: Point) =>
  x >= 0 && y >= 0 && x < maze.length && y < maze.length && !maze[x][y].taken;

const generatePath = (maze: CellInfo[][], recordStep: () => void) => {
  const N = maze.length;
  const end = { x: Math.floor(N / 2), y: N - 1 };
  let current = { x: Math.floor(N / 2), y: 0 };
  let prev = Direction.down;

  while (current.x !== end.x || current.y !== end.y) {
    maze[current.x][current.y].taken = true;

    // randomize direction
    const choices = shuffle([...Directions]);

    // Pick a valid direction that will leave the maze in solvable state
    const nextDirection = choices.find((d) => {
      const next = goInDirection(current, d);
      return isFree(maze, next) && isSolvable(maze, next, end);
    }) as Direction;

    maze[current.x][current.y].mainRoute = reverse(prev) | nextDirection;
    current = goInDirection(current, nextDirection);
    prev = nextDirection;

    recordStep();
  }

  maze[current.x][current.y].mainRoute = reverse(prev) | Direction.down;
  maze[current.x][current.y].taken = true;
  recordStep();
};

const generateFakeRoutes = (maze: CellInfo[][], recordStep: () => void) => {
  const getCandidates = (): [Point, Point, Direction][] => {
    const result: [Point, Point, Direction][] = [];
    maze.forEach((col, x) =>
      col.forEach((cell, y) => {
        if (cell.taken) {
          const current = { x, y };
          Directions.forEach((d) => {
            const next = goInDirection(current, d);
            if (isFree(maze, next)) {
              maze[next.x][next.y].candidate = true;
              result.push([current, next, d]);
            }
          });
        }
      })
    );
    return result;
  };

  let candidates = getCandidates();
  while (candidates.length) {
    const [from, to, dir] =
      candidates[Math.floor(Math.random() * candidates.length)];

    const fromCell = maze[from.x][from.y];
    fromCell.fakeRoute |= dir;

    const toCell = maze[to.x][to.y];
    toCell.fakeRoute |= reverse(dir);
    toCell.taken = true;
    toCell.candidate = false;

    recordStep();
    candidates = getCandidates();
  }
};

export type Maze = CellInfo[][];
export const generateMaze = (N: number): Maze[] => {
  console.log("generating maze ...");
  console.time("generateMaze");
  const snapshots: CellInfo[][][] = [];

  const maze = new Array(N).fill(0).map(() =>
    new Array(N).fill(0).map(() => ({
      mainRoute: Direction.none,
      fakeRoute: Direction.none,
      taken: false,
      candidate: false,
    }))
  );

  const recordStep = () => {
    const snapshot = maze.map((col) => col.map((cell) => ({ ...cell })));
    snapshots.push(snapshot);
  };

  recordStep();
  generatePath(maze, recordStep);
  generateFakeRoutes(maze, recordStep);

  console.timeEnd("generateMaze");
  return snapshots;
};

/* eslint-disable no-loop-func */
const N = 9;
export enum Direction {
  up = -1,
  down = 1,
  right = 2,
  left = -2,
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
  taken?: boolean;
  candidate?: boolean;
  mainRoute: Direction[];
  fakeRoute: Direction[];
};

export const maze: CellInfo[][] = new Array(N).fill(0).map(() =>
  new Array(N).fill(0).map(() => {
    return { mainRoute: [], fakeRoute: [] };
  })
);

const isSolvable = (start: Point, end: Point): boolean => {
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
      ).filter((p) => isFree(p) && !visited[p.x * N + p.y]);
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
  res.y += d % 2;
  if (Math.abs(d) > 1) {
    res.x += (d >> 1) % 2;
  }
  return res;
};

const isFree = ({ x, y }: Point) =>
  x >= 0 && y >= 0 && x < N && y < N && !maze[x][y].taken;

const generatePath = (start: Point, end: Point, rerender: () => void) => {
  let prev = Direction.down;
  let current = start;

  while (current.x !== end.x || current.y !== end.y) {
    maze[current.x][current.y].taken = true;

    // randomize direction
    const choices = shuffle([...Directions]);

    // Pick a valid direction that will leave the maze in solvable state
    const nextDirection = choices.find((d) => {
      const next = goInDirection(current, d);
      return isFree(next) && isSolvable(next, end);
    }) as Direction;

    maze[current.x][current.y].mainRoute = [reverse(prev), nextDirection];
    current = goInDirection(current, nextDirection);
    prev = nextDirection;

    rerender();
  }

  maze[current.x][current.y].mainRoute = [reverse(prev), Direction.down];
  maze[current.x][current.y].taken = true;
  rerender();
};

const generateFakeRoutes = async (rerender: () => void) => {
  const getCandidates = (): [Point, Point, Direction][] => {
    const result: [Point, Point, Direction][] = [];
    maze.forEach((col, x) =>
      col.forEach((cell, y) => {
        if (cell.taken) {
          const current = { x, y };
          Directions.forEach((d) => {
            const next = goInDirection(current, d);
            if (isFree(next)) {
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
    fromCell.fakeRoute.push(dir);

    const toCell = maze[to.x][to.y];
    toCell.fakeRoute.push(reverse(dir));
    toCell.taken = true;
    toCell.candidate = false;

    rerender();
    candidates = getCandidates();
  }
};

export const generateMaze = async (rerender: () => void) => {
  console.time("generateMaze");

  const start = { x: Math.floor(N / 2), y: 0 };
  const end = { x: Math.floor(N / 2), y: N - 1 };

  generatePath(start, end, rerender);
  generateFakeRoutes(rerender);
  
  console.timeEnd("generateMaze");
};

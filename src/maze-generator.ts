const N = 15;

export enum Direction {
  up = -1,
  down = 1,
  right = 2,
  left = -2,
}

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
  mainRoute: Direction[];
};

export const maze: CellInfo[][] = new Array(N).fill(0).map(() =>
  new Array(N).fill(0).map(() => {
    return { mainRoute: [] };
  })
);

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const isSolvable = (start: Point, end: Point): boolean => {
  const queue: Point[] = [start];

  const visited: boolean[] = new Array(N * N).fill(false);
  const directions = [
    Direction.up,
    Direction.right,
    Direction.down,
    Direction.left,
  ];

  while (queue.length && queue.length < N * N) {
    const current = queue.shift() as Point;
    if (current.x === end.x && current.y === end.y) {
      return true;
    }
    if (!visited[current.x * N + current.y]) {
      visited[current.x * N + current.y] = true;
      const candidates = directions
        .map((dir) => goInDirection(current, dir))
        .filter((p) => isFree(p) && !visited[p.x * N + p.y]);
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

const isFree = ({ x, y }: Point) => {
  if (x < 0 || y < 0 || x >= N || y >= N) {
    return false;
  }
  return !maze[x][y].taken;
};

const generatePath = async (
  s: Point,
  e: Point,
  prev: Direction,
  rerender: () => void
): Promise<boolean> => {
  await wait(16);
  rerender();

  if (s.x === e.x && s.y === e.y) {
    console.log("FOUND", e);
    maze[s.x][s.y].mainRoute = [reverse(prev), Direction.down];
    maze[s.x][s.y].taken = true;
    return true;
  }

  if (!isFree(s)) {
    return false;
  }

  if (!isSolvable(s, e)) {
    return false;
  }

  const choices = shuffle([
    Direction.up,
    Direction.right,
    Direction.down,
    Direction.left,
  ]);

  maze[s.x][s.y].taken = true;
  for (const next of choices) {
    // console.log(Direction[next]);
    maze[s.x][s.y].mainRoute = [reverse(prev), next];
    const found = await generatePath(goInDirection(s, next), e, next, rerender);
    if (found) {
      return true;
    }
  }
  console.log("back");
  maze[s.x][s.y].taken = false;
  maze[s.x][s.y].mainRoute = [];
  return false;
};

const generateFakeRoutes = (s: Point, e: Point, rerender: () => void) => {
  let c = { ...s };
  while (c.x !== e.x || c.y !== e.y) {
    console.log("--->", c);
    c = goInDirection(c, maze[c.x][c.y].mainRoute[1]);
  }
};

export const generateMaze = async (rerender: () => void) => {
  const start = { x: Math.floor(N / 2), y: 0 };
  const end = { x: Math.floor(N / 2), y: N - 1 };

  await generatePath(start, end, Direction.down, rerender);

  generateFakeRoutes(start, end, rerender);
};

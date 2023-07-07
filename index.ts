const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE,
  FALLING_STONE,
  BOX,
  FALLING_BOX,
  KEY1,
  LOCK1,
  KEY2,
  LOCK2,
}

interface FallingState {
  isFalling(): boolean;

  moveHorizontal(tile: Tile, dx: number): void;
}

class Falling implements FallingState {
  isFalling(): boolean {
    return true;
  }

  moveHorizontal(tile: Tile, dx: number): void {}
}

class Resting implements FallingState {
  isFalling(): boolean {
    return false;
  }

  moveHorizontal(tile: Tile, dx: number) {
    if (
      map[playerY][playerX + dx + dx].isAir() &&
      !map[playerY + 1][playerX + dx].isAir()
    ) {
      map[playerY][playerX + dx + dx] = tile;
      moveToTile(playerX + dx, playerY);
    }
  }
}

class FallStrategy {
  constructor(private falling: FallingState) {}

  getFalling() {
    return this.falling;
  }

  update(tile: Tile, x: number, y: number) {
    this.falling = map[y + 1][x].isAir() ? new Falling() : new Resting();
    this.drop(y, x, tile);
  }

  private drop(y: number, x: number, tile: Tile) {
    if (this.falling.isFalling()) {
      map[y + 1][x] = tile;
      map[y][x] = new Air();
    }
  }
}

interface Tile {
  update(x: number, y: number): void;

  canFall(): boolean;

  isAir(): boolean;

  isLock1(): boolean;

  isLock2(): boolean;

  draw(g: CanvasRenderingContext2D, x: number, y: number): void;

  moveHorizontal(dx: number): void;

  moveVertical(dy: number): void;

  drop(): void;

  rest(): void;
}

class Air implements Tile {
  isAir() {
    return true;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {}

  moveHorizontal(dx: number) {
    moveToTile(playerX + dx, playerY);
  }

  moveVertical(dy: number) {
    moveToTile(playerX, playerY + dy);
  }

  drop(): void {}

  rest(): void {}

  canFall(): boolean {
    return false;
  }

  update(): void {}
}

class Flux implements Tile {
  isAir() {
    return false;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {
    moveToTile(playerX + dx, playerY);
  }

  moveVertical(dy: number) {
    moveToTile(playerX, playerY + dy);
  }

  drop(): void {}

  rest(): void {}

  canFall(): boolean {
    return false;
  }

  update(x: number, y: number): void {}
}

class Unbreakable implements Tile {
  isAir() {
    return false;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {}

  moveVertical(dy: number) {}

  drop(): void {}

  rest(): void {}

  canFall(): boolean {
    return false;
  }

  update(x: number, y: number): void {}
}

class Player implements Tile {
  isAir() {
    return false;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {}

  moveHorizontal(dx: number) {}

  moveVertical(dy: number) {}

  drop(): void {}

  rest(): void {}

  canFall(): boolean {
    return false;
  }

  update(x: number, y: number): void {}
}

class Stone implements Tile {
  private fallStrategy: FallStrategy;

  constructor(public falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }

  isAir() {
    return false;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {
    this.fallStrategy.getFalling().moveHorizontal(this, dx);
  }

  moveVertical(dy: number) {}

  drop(): void {
    this.falling = new Falling();
  }

  rest(): void {
    this.falling = new Resting();
  }

  canFall(): boolean {
    return true;
  }

  update(x: number, y: number): void {
    if (map[y][x].canFall() && map[y + 1][x].isAir()) {
      this.falling = new Falling();
      map[y + 1][x] = this;
      map[y][x] = new Air();
    } else if (this.falling.isFalling()) {
      this.falling = new Resting();
    }
  }
}

class Box implements Tile {
  private fallStrategy: FallStrategy;

  constructor(public falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }

  canFall(): boolean {
    return true;
  }

  isAir() {
    return false;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {
    this.fallStrategy.getFalling().moveHorizontal(this, dx);
  }

  moveVertical(dy: number) {}

  drop(): void {
    this.falling = new Falling();
  }

  rest(): void {
    this.falling = new Resting();
  }

  update(x: number, y: number): void {
    if (map[y][x].canFall() && map[y + 1][x].isAir()) {
      this.falling = new Falling();
      map[y + 1][x] = this;
      map[y][x] = new Air();
    } else if (this.falling.isFalling()) {
      this.falling = new Resting();
    }
  }
}

class Key1 implements Tile {
  isAir() {
    return false;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ffcc00";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {
    remove(new RemoveLock1());
    moveToTile(playerX + dx, playerY);
  }

  moveVertical(dy: number) {
    remove(new RemoveLock1());
    moveToTile(playerX, playerY + dy);
  }

  drop(): void {}

  rest(): void {}

  canFall(): boolean {
    return false;
  }

  update(x: number, y: number): void {}
}

class Lock1 implements Tile {
  isAir() {
    return false;
  }

  isLock1() {
    return true;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ffcc00";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {}

  moveVertical(dy: number) {}

  drop(): void {}

  rest(): void {}

  canFall(): boolean {
    return false;
  }

  update(x: number, y: number): void {}
}

class Key2 implements Tile {
  isAir() {
    return false;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return false;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#00ccff";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {
    remove(new RemoveLock2());
    moveToTile(playerX + dx, playerY);
  }

  moveVertical(dy: number) {
    remove(new RemoveLock2());
    moveToTile(playerX, playerY + dy);
  }

  drop(): void {}

  rest(): void {}

  canFall(): boolean {
    return false;
  }

  update(x: number, y: number): void {}
}

class Lock2 implements Tile {
  isAir() {
    return false;
  }

  isLock1() {
    return false;
  }

  isLock2() {
    return true;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#00ccff";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) {}

  moveVertical(dy: number) {}

  drop(): void {}

  rest(): void {}

  canFall(): boolean {
    return false;
  }

  update(x: number, y: number): void {}
}

interface Input {
  handle(): void;
}

class Right implements Input {
  handle() {
    map[playerY][playerX + 1].moveHorizontal(1);
  }
}

class Left implements Input {
  handle() {
    map[playerY][playerX - 1].moveHorizontal(-1);
  }
}

class Up implements Input {
  handle() {
    map[playerY - 1][playerX].moveVertical(-1);
  }
}

class Down implements Input {
  handle() {
    map[playerY + 1][playerX].moveVertical(1);
  }
}

let playerX = 1;
let playerY = 1;
let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
let map: Tile[][];

function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function transformTile(tile: RawTile) {
  switch (tile) {
    case RawTile.AIR:
      return new Air();
    case RawTile.PLAYER:
      return new Player();
    case RawTile.UNBREAKABLE:
      return new Unbreakable();
    case RawTile.STONE:
      return new Stone(new Resting());
    case RawTile.FALLING_STONE:
      return new Stone(new Falling());
    case RawTile.BOX:
      return new Box(new Resting());
    case RawTile.FALLING_BOX:
      return new Box(new Falling());
    case RawTile.FLUX:
      return new Flux();
    case RawTile.KEY1:
      return new Key1();
    case RawTile.LOCK1:
      return new Lock1();
    case RawTile.KEY2:
      return new Key2();
    case RawTile.LOCK2:
      return new Lock2();
    default:
      assertExhausted(tile);
  }
}

function transformMap() {
  map = new Array(rawMap.length);
  for (let y = 0; y < rawMap.length; y++) {
    map[y] = new Array(rawMap[y].length);
    for (let x = 0; x < rawMap[y].length; x++) {
      map[y][x] = transformTile(rawMap[y][x]);
    }
  }
}

let inputs: Input[] = [];

interface RemoveStrategy {
  check(tile: Tile): boolean;
}

class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile) {
    return tile.isLock1();
  }
}

class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile) {
    return tile.isLock2();
  }
}

function remove(removeStrategy: RemoveStrategy) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (removeStrategy.check(map[y][x])) {
        map[y][x] = new Air();
      }
    }
  }
}

function moveToTile(newX: number, newY: number) {
  map[playerY][playerX] = new Air();
  map[newY][newX] = new Player();
  playerX = newX;
  playerY = newY;
}

function update() {
  handleInputs();
  updateMap();
}

function handleInputs() {
  while (inputs.length > 0) {
    let input = inputs.pop();
    input.handle();
  }
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].update(x, y);
    }
  }
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);
  return g;
}

function draw() {
  let g = createGraphics();
  drawMap(g);
  drawPlayer(g);
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].draw(g, x, y);
    }
  }
}

function drawPlayer(g: CanvasRenderingContext2D) {
  g.fillStyle = "#ff0000";
  g.fillRect(playerX * TILE_SIZE, playerY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  transformMap();
  gameLoop();
};

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", (e) => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});

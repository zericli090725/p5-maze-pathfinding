// MAZE GENERATION
// DEPTH FIRST SEARCH
// RECURSIVE BACKTRACKER

///////////////////////////////////////////////////////////////////////////////////////////////////
///////// CONFIGURATION /////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

let highlightCurrent = false; // change this value to control whether to highlight the current cell or not
let showVisited = false; // change this value to control whether to show visited cells or not
let frameRateValue = 1000; // change this value to control the speed of the maze generation
let saveImage = false; // change this value to control whether to save the maze as an image or not
let a = 50; // change this value to control the size of the cells

// BFS visualization speed
let bfsFrameRate = 1000;

let cols, rows;
let cells = [];
let current;
let stack = [];

// BFS
let queue = [];
let bfsCurrent;
let start;
let end;
let path = [];
let bfsFinished = false;

///////////////////////////////////////////////////////////////////////////////////////////////////
///////// GLOBAL /////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    // check if the cell is out of bounds
    return -1;
  }

  return i + j * cols;
}

function Cell(i, j) {
  this.i = i;
  this.j = j;

  this.walls = [true, true, true, true]; // top, right, bottom, left
  this.visited = false;

  // BFS variables
  this.bfsVisited = false;
  this.bfsProcessed = false;
  this.previous = undefined;

  this.checkNeighbors = function () {
    let neighbors = [];

    let top = cells[index(i, j - 1)];
    let right = cells[index(i + 1, j)];
    let bottom = cells[index(i, j + 1)];
    let left = cells[index(i - 1, j)];

    if (top && !top.visited) {
      neighbors.push(top);
    }

    if (right && !right.visited) {
      neighbors.push(right);
    }

    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }

    if (left && !left.visited) {
      neighbors.push(left);
    }

    if (neighbors.length > 0) {
      let r = floor(random(0, neighbors.length));
      return neighbors[r];
    } else {
      return undefined;
    }
  };

  // get neighbors that can actually be reached through the maze
  this.getOpenNeighbors = function () {
    let neighbors = [];

    let top = cells[index(i, j - 1)];
    let right = cells[index(i + 1, j)];
    let bottom = cells[index(i, j + 1)];
    let left = cells[index(i - 1, j)];

    // only add a neighbor if there is no wall between the cells
    if (top && !this.walls[0]) {
      neighbors.push(top);
    }

    if (right && !this.walls[1]) {
      neighbors.push(right);
    }

    if (bottom && !this.walls[2]) {
      neighbors.push(bottom);
    }

    if (left && !this.walls[3]) {
      neighbors.push(left);
    }

    return neighbors;
  };

  this.highlight = function () {
    let x = this.i * a;
    let y = this.j * a;

    noStroke();

    // warm gold highlight
    fill(255, 190, 80, 220);

    rect(x, y, a, a);
  };

  // show cells BFS has already searched
  this.showBFS = function () {
    let x = this.i * a;
    let y = this.j * a;

    if (this.bfsProcessed) {
      noStroke();

      // soft teal
      fill(47, 158, 157, 90);

      rect(x, y, a, a);
    }
  };

  this.show = function () {
    let x = this.i * a;
    let y = this.j * a;

    // visited cell fill
    if (this.visited && showVisited) {
      noStroke();

      // soft teal
      fill(47, 158, 157, 90);

      rect(x, y, a, a);
    }

    // maze walls
    stroke(220, 230, 240, 220);
    strokeWeight(1.5);
    noFill();

    if (this.walls[0]) {
      line(x, y, x + a, y); // top
    }

    if (this.walls[1]) {
      line(x + a, y, x + a, y + a); // right
    }

    if (this.walls[2]) {
      line(x + a, y + a, x, y + a); // bottom
    }

    if (this.walls[3]) {
      line(x, y + a, x, y); // left
    }
  };
}

function removeWalls(a, b) {
  let x = a.i - b.i;

  if (x === 1) {
    a.walls[3] = false; // remove left wall of a
    b.walls[1] = false; // remove right wall of b
  } else if (x === -1) {
    a.walls[1] = false; // remove right wall of a
    b.walls[3] = false; // remove left wall of b
  }

  let y = a.j - b.j;

  if (y === 1) {
    a.walls[0] = false; // remove top wall of a
    b.walls[2] = false; // remove bottom wall of b
  } else if (y === -1) {
    a.walls[2] = false; // remove bottom wall of a
    b.walls[0] = false; // remove top wall of b
  }
}

// process one cell of BFS every frame
function bfsStep() {
  if (queue.length === 0 || bfsFinished) {
    return;
  }

  // BFS uses a queue: first in, first out
  bfsCurrent = queue.shift();

  bfsCurrent.bfsProcessed = true;

  // stop once BFS reaches the bottom-right cell
  if (bfsCurrent === end) {
    bfsFinished = true;

    // reconstruct the path by following previous cells backwards
    let temp = end;

    while (temp) {
      path.push(temp);
      temp = temp.previous;
    }

    path.reverse();

    return;
  }

  let neighbors = bfsCurrent.getOpenNeighbors();

  for (let neighbor of neighbors) {
    if (!neighbor.bfsVisited) {
      neighbor.bfsVisited = true;

      // remember how we reached this cell
      neighbor.previous = bfsCurrent;

      queue.push(neighbor);
    }
  }
}

// draw the final path from the top-left cell to the bottom-right cell
function showPath() {
  if (path.length === 0) {
    return;
  }

  noFill();

  // warm gold highlight
  stroke(255, 190, 80, 220);
  strokeWeight(a * 0.15);

  beginShape();

  for (let cell of path) {
    let x = cell.i * a + a / 2;
    let y = cell.j * a + a / 2;

    vertex(x, y);
  }

  endShape();
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////// SKETCH //////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function setup() {
  frameRate(frameRateValue);

  createCanvas(windowWidth, windowHeight);

  cols = floor(width / a);
  rows = floor(height / a);

  for (let jj = 0; jj < rows; jj++) {
    for (let ii = 0; ii < cols; ii++) {
      let cell = new Cell(ii, jj);
      cells.push(cell);
    }
  }

  current = cells[0];

  while (true) {
    current.visited = true;

    let neighbor = current.checkNeighbors();

    if (neighbor) {
      stack.push(current);

      neighbor.visited = true;

      removeWalls(current, neighbor);

      current = neighbor;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      break;
    }
  }

  // BFS starts in the top-left cell and searches for the bottom-right cell
  start = cells[0];
  end = cells[cells.length - 1];

  start.bfsVisited = true;
  queue.push(start);

  // maze generation is instant, so now use a slower frame rate for BFS
  frameRate(bfsFrameRate);
}

function draw() {
  // deep navy background
  background(8, 15, 28);

  // search one new cell every frame
  bfsStep();

  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i];

    // show cells that BFS has already searched
    cell.showBFS();

    // highlight the cell BFS is currently searching
    if (cell === bfsCurrent && !bfsFinished) {
      cell.highlight();
    }

    cell.show();
  }

  if (highlightCurrent) {
    current.highlight();
  }

  // once BFS reaches the end, display the final path
  if (bfsFinished) {
    showPath();
  }

  if (saveImage) {
    save("maze.png");
  }

  if (bfsFinished) {
    noLoop();
  }
}
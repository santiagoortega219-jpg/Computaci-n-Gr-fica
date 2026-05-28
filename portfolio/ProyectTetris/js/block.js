"use strict";

var Block = function(blockType = 0, blockNumber = 0, x = 0, y = BOARD_HEIGHT - 1, z = 0) {
  if (blockType < 0 || blockType >= blocks.length) {
    blockType = 0;
  }

  var selectedBlock = blocks[blockType];

  this.color = selectedBlock.color;
  this.size = selectedBlock.size;
  this.depth = selectedBlock.depth;
  this.height = selectedBlock.height;
  this.width = selectedBlock.width;
  this.grid = selectedBlock.grid;

  this.xStart = x;
  this.yStart = y;
  this.zStart = z;

  this.xEnd = x + this.width - 1;
  this.yEnd = y + this.height - 1;
  this.zEnd = z + this.depth - 1;

  this.blockNumber = blockNumber;

  if (TESTING) {
    this.yStart = this.height - 1;
    this.yEnd = this.yStart + this.height - 1;
  }
};

Block.prototype = {
  constructor: Block,

  shiftX: function(offset = 1) {
    return this.moveBlock(offset, 0, 0);
  },

  shiftY: function(offset = 1) {
    return this.moveBlock(0, offset, 0);
  },

  shiftZ: function(offset = 1) {
    return this.moveBlock(0, 0, offset);
  },

  moveBlock: function(xOffset, yOffset, zOffset) {
    if (this.checkNewPosition(xOffset, yOffset, zOffset)) {
      this.updatePosition(xOffset, yOffset, zOffset);
      return true;
    }

    return false;
  },

  rotateX: function() {
    var rotatedGrid = this.createEmptyGrid();

    for (var z = 0; z < this.grid.length; z++) {
      for (var y = 0; y < this.grid[z].length; y++) {
        for (var x = 0; x < this.grid[z][y].length; x++) {
          var newX = x;
          var newY = this.size - 1 - z;
          var newZ = y;

          rotatedGrid[newZ][newY][newX] = this.grid[z][y][x];
        }
      }
    }

    this.tryRotation(rotatedGrid);
  },

  rotateY: function() {
    var rotatedGrid = this.createEmptyGrid();

    for (var z = 0; z < this.grid.length; z++) {
      for (var y = 0; y < this.grid[z].length; y++) {
        for (var x = 0; x < this.grid[z][y].length; x++) {
          var newX = this.size - 1 - z;
          var newY = y;
          var newZ = x;

          rotatedGrid[newZ][newY][newX] = this.grid[z][y][x];
        }
      }
    }

    this.tryRotation(rotatedGrid);
  },

  rotateZ: function() {
    var rotatedGrid = this.createEmptyGrid();

    for (var z = 0; z < this.grid.length; z++) {
      for (var y = 0; y < this.grid[z].length; y++) {
        for (var x = 0; x < this.grid[z][y].length; x++) {
          var newX = this.size - 1 - y;
          var newY = x;
          var newZ = z;

          rotatedGrid[newZ][newY][newX] = this.grid[z][y][x];
        }
      }
    }

    this.tryRotation(rotatedGrid);
  },

  createEmptyGrid: function() {
    var newGrid = [];

    for (var z = 0; z < this.grid.length; z++) {
      newGrid[z] = [];

      for (var y = 0; y < this.grid[z].length; y++) {
        newGrid[z][y] = [];

        for (var x = 0; x < this.grid[z][y].length; x++) {
          newGrid[z][y][x] = 0;
        }
      }
    }

    return newGrid;
  },

  tryRotation: function(newGrid) {
    var oldGrid = this.grid;

    this.grid = newGrid;

    if (this.checkNewPosition(0, 0, 0)) {
      this.updatePosition(0, 0, 0);
    } else {
      this.grid = oldGrid;
    }
  },

  checkNewPosition: function(xOffset = 0, yOffset = 0, zOffset = 0) {
    for (var z = 0; z < this.grid.length; z++) {
      for (var y = 0; y < this.grid[z].length; y++) {
        for (var x = 0; x < this.grid[z][y].length; x++) {
          if (this.grid[z][y][x] !== 1) {
            continue;
          }

          var boardX = this.xStart + x + xOffset;
          var boardY = this.yStart - y + yOffset;
          var boardZ = this.zStart + z + zOffset;

          var hasCollision = this.parent.checkCollision(
            boardX,
            boardY,
            boardZ,
            this.blockNumber
          );

          if (hasCollision) {
            return false;
          }
        }
      }
    }

    return true;
  },

  updatePosition: function(xOffset = 0, yOffset = 0, zOffset = 0) {
    this.removeFromBoard();

    this.xStart += xOffset;
    this.xEnd += xOffset;

    this.yStart += yOffset;
    this.yEnd += yOffset;

    this.zStart += zOffset;
    this.zEnd += zOffset;

    this.addToBoard();
  },

  removeFromBoard: function() {
    for (var y = 0; y < BOARD_HEIGHT; y++) {
      for (var z = 0; z < BOARD_SIZE; z++) {
        for (var x = 0; x < BOARD_SIZE; x++) {
          var currentCube = this.parent.grid[y][z][x];

          if (currentCube.blockNumber === this.blockNumber) {
            this.parent.removeCube(x, y, z);
          }
        }
      }
    }
  },

  addToBoard: function() {
    var cubeId = 0;

    for (var z = 0; z < this.grid.length; z++) {
      for (var y = 0; y < this.grid[z].length; y++) {
        for (var x = 0; x < this.grid[z][y].length; x++) {
          if (this.grid[z][y][x] !== 1) {
            continue;
          }

          var boardX = this.xStart + x;
          var boardY = this.yStart - y;
          var boardZ = this.zStart + z;

          var attachments = this.getAttachments(x, y, z);

          var hasCollision = this.parent.checkCollision(
            boardX,
            boardY,
            boardZ,
            this.blockNumber
          );

          if (hasCollision) {
            this.parent.parent.endGame();
            return;
          }

          var cube = this.parent.addCube(
            boardX,
            boardY,
            boardZ,
            this.color,
            this.blockNumber,
            attachments
          );

          cube.setId(cubeId);
          cubeId++;
        }
      }
    }

    if (CORNER_CUBES) {
      this.addCornerCubes();
    }
  },

  getAttachments: function(x, y, z) {
    return {
      xPos: this.hasCubeAt(x + 1, y, z),
      xNeg: this.hasCubeAt(x - 1, y, z),
      yPos: this.hasCubeAt(x, y - 1, z),
      yNeg: this.hasCubeAt(x, y + 1, z),
      zPos: this.hasCubeAt(x, y, z + 1),
      zNeg: this.hasCubeAt(x, y, z - 1)
    };
  },

  hasCubeAt: function(x, y, z) {
    if (z < 0 || z >= this.grid.length) {
      return false;
    }

    if (y < 0 || y >= this.grid[z].length) {
      return false;
    }

    if (x < 0 || x >= this.grid[z][y].length) {
      return false;
    }

    return this.grid[z][y][x] === 1;
  },

  addCornerCubes: function() {
    var x = this.xStart;
    var y = this.yStart;
    var z = this.zStart;

    addCube(x, y, z, 0xffffff);
    addCube(x + this.width - 1, y, z, 0xffffff);
    addCube(x, y - this.height + 1, z, 0xffffff);
    addCube(x + this.width - 1, y - this.height + 1, z, 0xffffff);

    addCube(x, y, z + this.depth - 1, 0xffffff);
    addCube(x + this.width - 1, y, z + this.depth - 1, 0xffffff);
    addCube(x, y - this.height + 1, z + this.depth - 1, 0xffffff);
    addCube(x + this.width - 1, y - this.height + 1, z + this.depth - 1, 0xffffff);
  }
};
"use strict";

var Board = function(size, height) {
  this.grid = [];

  for (var y = 0; y < height; y++) {
    var layer = [];

    for (var z = 0; z < size; z++) {
      var row = [];

      for (var x = 0; x < size; x++) {
        row.push(0);
      }

      layer.push(row);
    }

    this.grid.push(layer);
  }

  this.playMusic = false;
  this.boardType = DEFAULT_BOARD;
  this.floor = null;
  this.hasFloor = false;
  this.block = null;
  this.blockCounter = 0;

  this.ADD_FLOOR_TEXTURE = false;
  this.ADD_CUBE_TEXTURE = false;
  this.floorTexture = null;
  this.cubeTexture = null;
};

Board.prototype = {
  constructor: Board,

  addFloor: function() {
    if (!this.hasFloor) {
      this.hasFloor = true;

      var floorSize = BOARD_SIZE * CUBE_SIZE * FLOOR_SIZE_MULTIPLIER;

      var floorGeometry = new THREE.BoxGeometry(
        floorSize,
        FLOOR_THICKNESS,
        floorSize
      );

      var floorMaterial = new THREE.MeshLambertMaterial({
        color: 0x3a241b
      });

      this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
      this.floor.position.y = -FLOOR_THICKNESS / 2;

      this.parent.scene.add(this.floor);
    }
  },

  setCanadianMode: function() {
    if (this.ADD_FLOOR_TEXTURE && this.floorTexture && this.floor) {
      var floorMaterial = new THREE.MeshLambertMaterial({
        map: this.floorTexture
      });

      this.floor.material = floorMaterial;
    }

    for (var y = 0; y < this.grid.length; y++) {
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          if (this.grid[y][z][x] != 0) {
            this.grid[y][z][x].updateTexture();
          }
        }
      }
    }
  },

  unsetCanadianMode: function() {
    if (this.floor) {
      var floorMaterial = new THREE.MeshLambertMaterial({
        color: 0x3a241b
      });

      this.floor.material = floorMaterial;
    }

    for (var y = 0; y < this.grid.length; y++) {
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          if (this.grid[y][z][x] != 0) {
            this.grid[y][z][x].resetTexture();
          }
        }
      }
    }
  },

  clear: function() {
    for (var y = 0; y < this.grid.length; y++) {
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          if (this.grid[y][z][x] != 0) {
            this.parent.scene.remove(this.grid[y][z][x].cube);
            this.parent.scene.remove(this.grid[y][z][x].cubeOutline);
            this.grid[y][z][x] = 0;
          }
        }
      }
    }

    this.block = null;
  },

  setBoard: function(i = 0) {
    i = Number(i);

    if (i < 0 || i >= boards.length) {
      i = 0;
    }

    this.boardType = i;

    this.clear();
    this.block = null;
    this.blockCounter = 0;
    this.isBlank = true;

    for (var z = 0; z < boards[i].length; z++) {
      for (var x = 0; x < boards[i][z].length; x++) {
        if (boards[i][z][x] != 0) {
          this.grid[0][z][x] = this.addCube(x, 0, z, 0x888888, 0);
          this.isBlank = false;
        }
      }
    }

    this.blockCounter += 1;
  },

  reset: function() {
    this.setBoard(this.boardType);
  },

  addBlock: function(blockType = 1, x = 0, y = BOARD_HEIGHT - 1, z = 0) {
    this.block = new Block(blockType, this.blockCounter, x, y, z);

    Object.defineProperty(this.block, "parent", {
      value: this
    });

    this.block.addToBoard(this);
    this.blockCounter += 1;
  },

  addRandomBlock: function() {
    if (this.parent.debugMode) {
      this.addBlock(0);
    } else {
      var blockType = Math.floor(Math.random() * blocks.length);
      this.addBlock(blockType);
    }
  },

  addCube: function(
    x = 0,
    y = 0,
    z = 0,
    color = 0xffffff,
    blockNumber = this.blockCounter,
    attachments = {}
  ) {
    if (!this.checkCollision(x, y, z, blockNumber)) {
      var cube = new Cube(x, y, z, color, blockNumber, attachments);

      Object.defineProperty(cube, "parent", {
        value: this
      });

      if (this.parent.mode1 || this.parent.canadianMode) {
        cube.updateTexture();
      }

      this.grid[y][z][x] = cube;
      cube.addToScene(this.parent.scene);

      return cube;
    } else {
      return null;
    }
  },

  removeCube: function(x = 0, y = 0, z = 0) {
    if (this.grid[y][z][x] != 0) {
      var cube = this.grid[y][z][x];

      if (cube.attachments.xPos == true && this.grid[y][z][x + 1] != 0) {
        this.grid[y][z][x + 1].attachments.xNeg = false;
      }

      if (cube.attachments.xNeg == true && this.grid[y][z][x - 1] != 0) {
        this.grid[y][z][x - 1].attachments.xPos = false;
      }

      if (cube.attachments.yPos == true && this.grid[y + 1][z][x] != 0) {
        this.grid[y + 1][z][x].attachments.yNeg = false;
      }

      if (cube.attachments.yNeg == true && this.grid[y - 1][z][x] != 0) {
        this.grid[y - 1][z][x].attachments.yPos = false;
      }

      if (cube.attachments.zPos == true && this.grid[y][z + 1][x] != 0) {
        this.grid[y][z + 1][x].attachments.zNeg = false;
      }

      if (cube.attachments.zNeg == true && this.grid[y][z - 1][x] != 0) {
        this.grid[y][z - 1][x].attachments.zPos = false;
      }

      this.parent.scene.remove(cube.cube);
      this.parent.scene.remove(cube.cubeOutline);
      this.grid[y][z][x] = 0;
    }
  },

  shiftBlockX: function(offset = 1) {
    if (this.block) {
      return this.block.shiftX(offset);
    }

    return false;
  },

  shiftBlockY: function(offset = 1) {
    if (this.block) {
      return this.block.shiftY(offset);
    }

    return false;
  },

  shiftBlockZ: function(offset = 1) {
    if (this.block) {
      return this.block.shiftZ(offset);
    }

    return false;
  },

  rotateBlockX: function() {
    if (this.block) {
      this.block.rotateX();
    }
  },

  rotateBlockY: function() {
    if (this.block) {
      this.block.rotateY();
    }
  },

  rotateBlockZ: function() {
    if (this.block) {
      this.block.rotateZ();
    }
  },

  checkCollision: function(x, y, z, blockNumber) {
    if (
      y >= this.grid.length ||
      y < 0 ||
      z >= this.grid[y].length ||
      z < 0 ||
      x >= this.grid[y][z].length ||
      x < 0
    ) {
      return true;
    } else {
      if (
        this.grid[y][z][x] != 0 &&
        this.grid[y][z][x].blockNumber != blockNumber
      ) {
        return true;
      } else {
        return false;
      }
    }
  },

  addToScene: function(scene) {
    for (var y = 0; y < this.grid.length; y++) {
      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          if (this.grid[y][z][x] != 0) {
            this.grid[y][z][x].addToScene(scene);
          }
        }
      }
    }
  },

  checkLayers: function() {
    var layersComplete = [];

    for (var y = 0; y < this.grid.length; y++) {
      var thisLayerComplete = true;

      for (var z = 0; z < this.grid[y].length; z++) {
        for (var x = 0; x < this.grid[y][z].length; x++) {
          if (this.grid[y][z][x] == 0) {
            thisLayerComplete = false;
          }
        }
      }

      if (thisLayerComplete) {
        layersComplete.push(y);

        for (var z2 = 0; z2 < this.grid[y].length; z2++) {
          for (var x2 = 0; x2 < this.grid[y][z2].length; x2++) {
            if (this.grid[y][z2][x2].blockNumber != 0) {
              this.removeCube(x2, y, z2);
            }
          }
        }

        this.parent.incrementLevelCounter();
      }
    }

    return layersComplete;
  },

  cubeCanFall: function(x, y, z, checked = []) {
    var cube = this.grid[y][z][x];

    if (
      y <= 0 ||
      y >= this.grid.length ||
      z < 0 ||
      z >= this.grid[y].length ||
      x < 0 ||
      x >= this.grid[y][z].length ||
      cube == 0
    ) {
      return false;
    }

    checked.push(cube.getId());

    var canFall = true;

    if (this.checkCollision(x, y - 1, z, cube.blockNumber)) {
      canFall = false;
    }

    if (cube.attachments.xPos == true) {
      var xPos = this.grid[y][z][x + 1];

      if (xPos != 0 && checked.indexOf(xPos.getId()) < 0) {
        if (!this.cubeCanFall(x + 1, y, z, checked)) {
          canFall = false;
        }
      }
    }

    if (cube.attachments.xNeg == true) {
      var xNeg = this.grid[y][z][x - 1];

      if (xNeg != 0 && checked.indexOf(xNeg.getId()) < 0) {
        if (!this.cubeCanFall(x - 1, y, z, checked)) {
          canFall = false;
        }
      }
    }

    if (cube.attachments.yPos == true) {
      var yPos = this.grid[y + 1][z][x];

      if (yPos != 0 && checked.indexOf(yPos.getId()) < 0) {
        if (!this.cubeCanFall(x, y + 1, z, checked)) {
          canFall = false;
        }
      }
    }

    if (cube.attachments.yNeg == true) {
      var yNeg = this.grid[y - 1][z][x];

      if (yNeg != 0 && checked.indexOf(yNeg.getId()) < 0) {
        if (!this.cubeCanFall(x, y - 1, z, checked)) {
          canFall = false;
        }
      }
    }

    if (cube.attachments.zPos == true) {
      var zPos = this.grid[y][z + 1][x];

      if (zPos != 0 && checked.indexOf(zPos.getId()) < 0) {
        if (!this.cubeCanFall(x, y, z + 1, checked)) {
          canFall = false;
        }
      }
    }

    if (cube.attachments.zNeg == true) {
      var zNeg = this.grid[y][z - 1][x];

      if (zNeg != 0 && checked.indexOf(zNeg.getId()) < 0) {
        if (!this.cubeCanFall(x, y, z - 1, checked)) {
          canFall = false;
        }
      }
    }

    return canFall;
  },

  advanceLayers: function(layersComplete = []) {
    for (var i = 0; i < layersComplete.length; i++) {
      if ((layersComplete[i] == 0 && this.isBlank) || layersComplete[i] > 0) {
        var y = layersComplete[i] + 1;
        y -= i;

        for (; y < this.grid.length; y++) {
          for (var z = 0; z < this.grid[y].length; z++) {
            for (var x = 0; x < this.grid[y][z].length; x++) {
              if (this.grid[y][z][x] != 0) {
                this.grid[y][z][x].addY(-1);
                this.grid[y - 1][z][x] = this.grid[y][z][x];
                this.grid[y][z][x] = 0;
              }
            }
          }
        }
      }
    }

    for (var y2 = 1; y2 < this.grid.length; y2++) {
      for (var z2 = 0; z2 < this.grid[y2].length; z2++) {
        for (var x2 = 0; x2 < this.grid[y2][z2].length; x2++) {
          if (this.grid[y2][z2][x2] != 0) {
            if (this.cubeCanFall(x2, y2, z2)) {
              this.grid[y2][z2][x2].addY(-1);
              this.grid[y2 - 1][z2][x2] = this.grid[y2][z2][x2];
              this.grid[y2][z2][x2] = 0;
            }
          }
        }
      }
    }
  },

  advance: function() {
    if (this.block == null) {
      this.addRandomBlock();
    }

    var blockStopped = !this.block.shiftY(-1);

    if (blockStopped) {
      var layersComplete = this.checkLayers();

      while (layersComplete.length > 0) {
        this.advanceLayers(layersComplete);
        layersComplete = this.checkLayers();
      }

      this.addRandomBlock();
    }
  }
};
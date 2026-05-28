"use strict";

var Game = function() {
  this.scene = null;
  this.camera = null;
  this.board = null;
  this.renderer = null;

  this.levelLabel = document.getElementById("level-label");
  this.pointsLabel = document.getElementById("points-label");

  this.cameraRot = 0;
  this.dropThreshold = 80;
  this.dropCounter = 0;

  this.keepPlaying = false;
  this.paused = true;
  this.boardType = DEFAULT_BOARD;

  this.initialized = false;
  this.keysAreBound = false;
  this.playMusic = true;
  this.volume = 0.5;
  this.sensitivity = 1;

  this.sound = null;
  this.menuSound = null;
  this.gameOverSound = null;
  this.audioLoader = null;

  this.score = 0;
  this.level = 0;
  this.levelCounter = 0;
  this.speedModifier = 1;

  this.mode1 = false;
  this.mode2 = false;
  this.canadianMode = false;
};

Game.prototype = {
  constructor: Game,

  init: function() {
    this.initialized = true;

    this.hideGameInfo();
    this.hideConfigScreen();
    this.showStartGameMenu();

    this.createScene();
    this.createCamera();
    this.createLights();
    this.createSkyBox();
    this.createBoard();
    this.loadExternalResources();
    this.addHelpers();
    this.createRenderer();
    this.createControlsPage();
    this.setupCustomButtons();
    this.bindKeyboard();

    document.body.appendChild(this.renderer.domElement);
  },

  createScene: function() {
    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color(0x2b1a14);
    this.scene.fog = new THREE.FogExp2(0x2b1a14, 0.00022);
  },

  createCamera: function() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    this.updateCameraPosition();
  },

  updateCameraPosition: function() {
    this.camera.position.y = CAMERA_Y;
    this.camera.position.x = Math.sin(this.cameraRot) * CAMERA_X;
    this.camera.position.z = Math.cos(this.cameraRot) * CAMERA_Z;

    this.camera.lookAt(
      new THREE.Vector3(CAMERA_POINT_X, CAMERA_POINT_Y, CAMERA_POINT_Z)
    );
  },

  createLights: function() {
    var ambientLight = new THREE.AmbientLight(0xf3dfaa, 0.7);
    this.scene.add(ambientLight);

    var mainLight = new THREE.DirectionalLight(0xffdf8a, 1.05);
    mainLight.position.set(500, 900, 400);
    this.scene.add(mainLight);

    var redLight = new THREE.PointLight(0xb34a32, 1.35, 1800);
    redLight.position.set(-450, 500, 600);
    this.scene.add(redLight);

    var goldLight = new THREE.PointLight(0xffc95c, 1.25, 1600);
    goldLight.position.set(500, 350, -500);
    this.scene.add(goldLight);
  },

  createSkyBox: function() {
    var geometry = new THREE.BoxGeometry(5000, 5000, 5000);

    var material = new THREE.MeshBasicMaterial({
      color: 0x3a241b,
      side: THREE.BackSide
    });

    var skyBox = new THREE.Mesh(geometry, material);
    this.scene.add(skyBox);
  },

  createBoard: function() {
    this.board = new Board(BOARD_SIZE, BOARD_HEIGHT);

    Object.defineProperty(this.board, "parent", {
      value: this
    });

    this.board.setBoard(DEFAULT_BOARD);
    this.board.addFloor();

    this.applyBoardStyle();
  },

  applyBoardStyle: function() {
    if (this.board && this.board.floor) {
      this.board.floor.material = new THREE.MeshLambertMaterial({
        color: 0x3a241b
      });
    }
  },

  addHelpers: function() {
    if (ADD_GRID_HELPER) {
      var gridSize = BOARD_SIZE * CUBE_SIZE;
      var gridDivisions = BOARD_SIZE;

      var gridHelper = new THREE.GridHelper(
        gridSize,
        gridDivisions,
        0xd6a93e,
        0x7d1919
      );

      this.scene.add(gridHelper);
    }

    if (ADD_AXIS_HELPER) {
      var axisLength = (BOARD_SIZE * CUBE_SIZE) / 2;
      var axisHelper = new THREE.AxisHelper(axisLength);

      this.scene.add(axisHelper);
    }
  },

  createRenderer: function() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setClearColor(0x2b1a14, 1);

    if (this.renderer.shadowMap) {
      this.renderer.shadowMap.enabled = true;
    }
  },

  bindKeyboard: function() {
    if (this.keysAreBound) {
      return;
    }

    this.keysAreBound = true;

    var thisGame = this;

    document.addEventListener("keydown", function(event) {
      thisGame.handleKeyDown(event);
    });
  },

  handleKeyDown: function(event) {
    var controlsPage = document.getElementById("controls-page");

    if (controlsPage && controlsPage.className.indexOf("hidden") < 0) {
      return;
    }

    var configScreen = document.getElementById("config-screen");

    if (configScreen && configScreen.className.indexOf("hidden") < 0) {
      return;
    }

    var key = event.key;

    if (key === "q" || key === "Q") {
      this.togglePause();
      return;
    }

    if (key === "Escape") {
      this.endGame();
      return;
    }

    if (key === "c" || key === "C") {
      this.toggleMode1();
      return;
    }

    if (key === "v" || key === "V") {
      this.toggleMode2();
      return;
    }

    if (this.paused) {
      return;
    }

    if (key === "ArrowUp") {
      this.shiftBlockUp();
    } else if (key === "ArrowDown") {
      this.shiftBlockDown();
    } else if (key === "ArrowLeft") {
      this.shiftBlockLeft();
    } else if (key === "ArrowRight") {
      this.shiftBlockRight();
    } else if (key === " ") {
      this.dropBlock();
    } else if (key === "s" || key === "S") {
      this.rotateBlockX();
    } else if (key === "d" || key === "D") {
      this.rotateBlockY();
    } else if (key === "f" || key === "F") {
      this.rotateBlockZ();
    } else if (key === "e" || key === "E") {
      this.rotateCamera(-ROTATION_AMOUNT * this.sensitivity);
    } else if (key === "r" || key === "R") {
      this.rotateCamera(ROTATION_AMOUNT * this.sensitivity);
    }
  },

  createControlsPage: function() {
    var thisGame = this;
    var ui = document.getElementById("ui");

    if (!ui) {
      console.error("No se encontró el elemento #ui.");
      return;
    }

    this.hideOldControls();

    var openButton = this.getOrCreateControlsButton(ui);
    var controlsPage = this.getOrCreateControlsPage(ui);
    var closeButton = document.getElementById("close-controls-button");
    var wasPlayingBeforeControls = false;

    openButton.onclick = function(event) {
      event.preventDefault();
      event.stopPropagation();

      wasPlayingBeforeControls = thisGame.keepPlaying && !thisGame.paused;

      if (wasPlayingBeforeControls) {
        thisGame.pauseWithoutOverlay();
      }

      thisGame.showNode(controlsPage);
    };

    closeButton.onclick = function(event) {
      event.preventDefault();
      event.stopPropagation();

      thisGame.hideNode(controlsPage);
      thisGame.resumeAfterControls(wasPlayingBeforeControls);

      wasPlayingBeforeControls = false;
    };

    controlsPage.onclick = function(event) {
      if (event.target === controlsPage) {
        event.preventDefault();
        event.stopPropagation();

        thisGame.hideNode(controlsPage);
        thisGame.resumeAfterControls(wasPlayingBeforeControls);

        wasPlayingBeforeControls = false;
      }
    };
  },

  hideOldControls: function() {
    var oldControls = document.getElementById("controls");

    if (oldControls) {
      this.hideNode(oldControls);
    }
  },

  getOrCreateControlsButton: function(ui) {
    var button = document.getElementById("open-controls-button");

    if (!button) {
      button = document.createElement("button");
      button.id = "open-controls-button";
      button.className = "button";
      button.type = "button";
      button.innerHTML = "Controles";

      var configPanel = document.querySelector("#config-screen .config-panel");

      if (configPanel) {
        configPanel.appendChild(button);
      } else {
        ui.appendChild(button);
      }
    }

    button.className = "button";
    button.type = "button";
    button.innerHTML = "Controles";

    return button;
  },

  getOrCreateControlsPage: function(ui) {
    var page = document.getElementById("controls-page");

    if (!page) {
      page = document.createElement("div");
      page.id = "controls-page";
      page.className = "controls-page hidden";

      page.innerHTML =
        '<div class="controls-card">' +
          '<h2>Controles</h2>' +
          '<div class="controls-grid">' +
            '<div><span>Flechas</span><p>Mover el bloque</p></div>' +
            '<div><span>Espacio</span><p>Bajar el bloque una capa</p></div>' +
            '<div><span>S, D, F</span><p>Rotar el bloque en X, Y y Z</p></div>' +
            '<div><span>Q</span><p>Pausar o continuar el juego</p></div>' +
            '<div><span>Escape</span><p>Terminar la partida</p></div>' +
            '<div><span>E</span><p>Rotar la cámara hacia un lado</p></div>' +
            '<div><span>R</span><p>Rotar la cámara hacia el otro lado</p></div>' +
            '<div><span>C</span><p>Activar o desactivar Mode 1</p></div>' +
            '<div><span>V</span><p>Activar o desactivar Mode 2</p></div>' +
          '</div>' +
          '<button id="close-controls-button" class="button" type="button">' +
            'Volver' +
          '</button>' +
        '</div>';

      ui.appendChild(page);
    }

    return page;
  },

  pauseWithoutOverlay: function() {
    this.paused = true;

    if (this.sound && this.sound.isPlaying) {
      this.sound.pause();
    }
  },

  resumeAfterControls: function(wasPlaying) {
    if (wasPlaying && this.keepPlaying) {
      this.paused = false;

      if (this.playMusic && this.sound && this.sound.buffer && !this.sound.isPlaying) {
        this.sound.play();
      }
    }
  },

  setupCustomButtons: function() {
    this.updateCustomButtonStates();
  },

  setupButton: function(id, text, action) {
    var thisGame = this;
    var button = document.getElementById(id);

    if (!button) {
      return;
    }

    button.id = id;
    button.innerHTML = text;

    button.onclick = function(event) {
      event.preventDefault();
      event.stopPropagation();

      action.call(thisGame);
      thisGame.updateCustomButtonStates();
    };
  },

  updateCustomButtonStates: function() {
  },

  loadExternalResources: function() {
    this.loadAudio();
    this.loadFloorTexture();
    this.loadCubeTexture();
  },

  loadAudio: function() {
    var thisGame = this;
    var listener = new THREE.AudioListener();

    this.camera.add(listener);

    this.sound = new THREE.Audio(listener);
    this.menuSound = new THREE.Audio(listener);
    this.gameOverSound = new THREE.Audio(listener);

    this.audioLoader = new THREE.AudioLoader();

    this.audioLoader.load("audio/theme.mp3", function(buffer) {
      thisGame.sound.setBuffer(buffer);
      thisGame.sound.setLoop(true);
      thisGame.sound.setVolume(thisGame.volume);
    });

    this.audioLoader.load("audio/musicinicio.mp3", function(buffer) {
      thisGame.menuSound.setBuffer(buffer);
      thisGame.menuSound.setLoop(true);
      thisGame.menuSound.setVolume(thisGame.volume);

      if (!thisGame.keepPlaying) {
        thisGame.playMenuMusic();
      }
    });

    this.audioLoader.load("audio/final.mp3", function(buffer) {
      thisGame.gameOverSound.setBuffer(buffer);
      thisGame.gameOverSound.setLoop(false);
      thisGame.gameOverSound.setVolume(thisGame.volume);
    });
  },

  setVolume: function(value) {
    this.volume = value;

    if (this.sound) {
      this.sound.setVolume(this.volume);
    }

    if (this.menuSound) {
      this.menuSound.setVolume(this.volume);
    }

    if (this.gameOverSound) {
      this.gameOverSound.setVolume(this.volume);
    }

    this.syncSettingsUI();
  },

  setSensitivity: function(value) {
    this.sensitivity = value;
    this.syncSettingsUI();
  },

  playMenuMusic: function() {
    if (this.menuSound && this.menuSound.buffer && !this.keepPlaying) {
      if (this.sound && this.sound.isPlaying) {
        this.sound.stop();
      }

      if (this.gameOverSound && this.gameOverSound.isPlaying) {
        this.gameOverSound.stop();
      }

      if (!this.menuSound.isPlaying) {
        this.menuSound.play();
      }
    }
  },

  stopMenuMusic: function() {
    if (this.menuSound && this.menuSound.isPlaying) {
      this.menuSound.stop();
    }
  },

  playGameOverMusic: function() {
    if (this.gameOverSound && this.gameOverSound.buffer) {
      if (this.sound && this.sound.isPlaying) {
        this.sound.stop();
      }

      if (this.menuSound && this.menuSound.isPlaying) {
        this.menuSound.stop();
      }

      if (this.gameOverSound.isPlaying) {
        this.gameOverSound.stop();
      }

      this.gameOverSound.play();
    }
  },

  stopGameOverMusic: function() {
    if (this.gameOverSound && this.gameOverSound.isPlaying) {
      this.gameOverSound.stop();
    }
  },

  loadFloorTexture: function() {
    var thisGame = this;

    this.board.ADD_FLOOR_TEXTURE = false;
    this.board.floorLoader = new THREE.TextureLoader();

    this.board.floorLoader.load(FLOOR_TEXTURE_PATH, function(texture) {
      thisGame.board.ADD_FLOOR_TEXTURE = true;
      thisGame.board.floorTexture = texture;

      if (thisGame.mode1 && thisGame.board.setCanadianMode) {
        thisGame.board.setCanadianMode();
      }
    });
  },

  loadCubeTexture: function() {
    var thisGame = this;

    this.board.ADD_CUBE_TEXTURE = false;
    this.board.cubeLoader = new THREE.TextureLoader();

    this.board.cubeLoader.load(CUBE_TEXTURE_PATH, function(texture) {
      thisGame.board.ADD_CUBE_TEXTURE = true;
      thisGame.board.cubeTexture = texture;

      if (thisGame.mode1 && thisGame.board.setCanadianMode) {
        thisGame.board.setCanadianMode();
      }
    });
  },

  showNode: function(node) {
    if (node && node.className.indexOf("hidden") >= 0) {
      node.className = node.className.replace("hidden", "").trim();
    }
  },

  hideNode: function(node) {
    if (node && node.className.indexOf("hidden") < 0) {
      node.className = (node.className + " hidden").trim();
    }
  },

  showGameInfo: function() {
    this.showNode(document.getElementById("game-info"));
  },

  hideGameInfo: function() {
    this.hideNode(document.getElementById("game-info"));
  },

  showStartGameOverlay: function() {
    this.showNode(document.getElementById("overlay-start-game"));
  },

  hideStartGameOverlay: function() {
    this.hideNode(document.getElementById("overlay-start-game"));
  },

  showPausedOverlay: function() {
    this.showNode(document.getElementById("overlay-paused"));
  },

  hidePausedOverlay: function() {
    this.hideNode(document.getElementById("overlay-paused"));
  },

  showGameOverOverlay: function() {
    this.showNode(document.getElementById("overlay-game-over"));
  },

  hideGameOverOverlay: function() {
    this.hideNode(document.getElementById("overlay-game-over"));
  },

  showBoardSelectorOverlay: function() {
    this.showNode(document.getElementById("overlay-board-selector"));
  },

  hideBoardSelectorOverlay: function() {
    this.hideNode(document.getElementById("overlay-board-selector"));
  },

  showOverlay: function() {
    this.showNode(document.getElementById("overlay"));

    this.hideStartGameOverlay();
    this.hidePausedOverlay();
    this.hideGameOverOverlay();
    this.hideBoardSelectorOverlay();
  },

  hideOverlay: function() {
    this.hideNode(document.getElementById("overlay"));
  },

  showConfigScreen: function() {
    document.body.className = document.body.className.replace("game-running", "").trim();

    this.hideGameInfo();
    this.hideOverlay();

    this.syncSettingsUI();

    var configScreen = document.getElementById("config-screen");

    if (configScreen) {
      this.showNode(configScreen);
    }

    this.stopGameOverMusic();
    this.playMenuMusic();
  },

  hideConfigScreen: function() {
    var configScreen = document.getElementById("config-screen");

    if (configScreen) {
      this.hideNode(configScreen);
    }
  },

  showStartGameMenu: function() {
    document.body.className = document.body.className.replace("game-running", "").trim();

    this.hideGameInfo();
    this.hideConfigScreen();

    this.showOverlay();
    this.showStartGameOverlay();
    this.showBoardSelectorOverlay();

    this.syncSettingsUI();

    this.stopGameOverMusic();
    this.playMenuMusic();
  },

  showPauseMenu: function() {
    this.showGameInfo();
    this.hideConfigScreen();

    this.showOverlay();
    this.showPausedOverlay();
  },

  showGameOverMenu: function() {
    this.hideGameInfo();
    this.hideConfigScreen();

    this.showOverlay();
    this.showGameOverOverlay();
    this.showBoardSelectorOverlay();

    this.stopMenuMusic();
    this.playGameOverMusic();
  },

  syncSettingsUI: function() {
    var mainBoardSelect = document.getElementById("main-board-select");
    var volumeSlider = document.getElementById("volume-slider");
    var sensitivitySlider = document.getElementById("sensitivity-slider");

    if (mainBoardSelect) {
      mainBoardSelect.value = this.boardType;
    }

    if (volumeSlider) {
      volumeSlider.value = this.volume;
    }

    if (sensitivitySlider) {
      sensitivitySlider.value = this.sensitivity;
    }
  },

  updateLevelLabel: function() {
    this.levelLabel.innerHTML = "Level " + (this.level + 1);
  },

  updatePointsLabel: function() {
    this.pointsLabel.innerHTML = "Points: " + this.score;
  },

  run: function() {
    if (!this.initialized) {
      this.init();
    }

    this.animate();
  },

  startGame: function() {
    this.keepPlaying = true;
    this.paused = false;

    if (document.body.className.indexOf("game-running") < 0) {
      document.body.className = (document.body.className + " game-running").trim();
    }

    this.hideConfigScreen();

    this.stopMenuMusic();
    this.stopGameOverMusic();

    this.resetScore();

    if (this.sound) {
      this.sound.setPlaybackRate(1);
    }

    this.board.reset();
    this.applyBoardStyle();

    if (this.mode1 && this.board.setCanadianMode) {
      this.board.setCanadianMode();
    }

    this.updateLevelLabel();
    this.updatePointsLabel();

    this.showGameInfo();

    if (this.playMusic && this.sound && this.sound.buffer && !this.sound.isPlaying) {
      this.sound.play();
    }

    this.hideOverlay();
    this.updateCustomButtonStates();
  },

  backToMenu: function() {
    this.keepPlaying = false;
    this.paused = true;

    document.body.className = document.body.className.replace("game-running", "").trim();

    this.hideGameInfo();
    this.hideConfigScreen();

    if (this.sound && this.sound.isPlaying) {
      this.sound.stop();
    }

    this.stopGameOverMusic();

    if (this.board) {
      this.board.reset();
      this.applyBoardStyle();

      if (this.mode1 && this.board.setCanadianMode) {
        this.board.setCanadianMode();
      }
    }

    this.showStartGameMenu();
  },

  resetScore: function() {
    this.score = 0;
    this.level = 0;
    this.levelCounter = 0;
    this.speedModifier = 1;
  },

  endGame: function() {
    if (!this.keepPlaying) {
      return;
    }

    this.keepPlaying = false;
    this.paused = true;

    document.body.className = document.body.className.replace("game-running", "").trim();

    this.hideGameInfo();
    this.hideConfigScreen();

    if (this.sound && this.sound.isPlaying) {
      this.sound.stop();
    }

    this.stopMenuMusic();
    this.playGameOverMusic();

    this.showGameOverMenu();
  },

  setBoard: function(boardType = 0) {
    this.boardType = Number(boardType);

    if (this.board) {
      if (this.mode2) {
        this.board.setBoard(3);
      } else {
        this.board.setBoard(this.boardType);
      }

      this.applyBoardStyle();

      if (this.mode1 && this.board.setCanadianMode) {
        this.board.setCanadianMode();
      }
    }

    this.syncSettingsUI();
  },

  setMode1: function(active) {
    this.mode1 = active;
    this.canadianMode = this.mode1;

    if (this.board) {
      if (this.mode1 && this.board.setCanadianMode) {
        this.board.setCanadianMode();
      }

      if (!this.mode1 && this.board.unsetCanadianMode) {
        this.board.unsetCanadianMode();
        this.applyBoardStyle();
      }
    }

    this.syncSettingsUI();
  },

  setMode2: function(active) {
    this.mode2 = active;

    if (this.board) {
      if (this.mode2) {
        this.board.setBoard(3);
      } else {
        this.board.setBoard(this.boardType);
      }

      this.applyBoardStyle();

      if (this.mode1 && this.board.setCanadianMode) {
        this.board.setCanadianMode();
      }
    }

    if (this.keepPlaying) {
      this.endGame();
      this.startGame();
    }

    this.updateLevelLabel();
    this.updatePointsLabel();
    this.syncSettingsUI();
  },

  toggleMode1: function() {
    this.setMode1(!this.mode1);
  },

  toggleMode2: function() {
    this.setMode2(!this.mode2);
  },

  togglePause: function() {
    if (!this.keepPlaying) {
      return;
    }

    if (this.paused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  },

  pauseGame: function() {
    this.paused = true;

    if (this.sound && this.sound.isPlaying) {
      this.sound.pause();
    }

    this.showPauseMenu();
  },

  resumeGame: function() {
    this.paused = false;

    if (this.playMusic && this.sound && this.sound.buffer && !this.sound.isPlaying) {
      this.sound.play();
    }

    this.showGameInfo();
    this.hideOverlay();
  },

  toggleMusic: function() {
    this.playMusic = !this.playMusic;

    if (!this.playMusic && this.sound && this.sound.isPlaying) {
      this.sound.pause();
    }

    if (this.playMusic && !this.paused && this.sound && this.sound.buffer && !this.sound.isPlaying) {
      this.sound.play();
    }
  },

  incrementLevelCounter: function() {
    this.score += 1000;
    this.levelCounter++;

    if (this.levelCounter >= 3) {
      this.increaseLevel();
    }

    this.updateLevelLabel();
    this.updatePointsLabel();
  },

  increaseLevel: function() {
    this.levelCounter = 0;
    this.level++;

    if (this.level % 2 === 0 && this.speedModifier > MINIMUM_SPEED_MODIFIER) {
      this.speedModifier *= 0.70;

      if (this.speedModifier < 1 && this.sound) {
        this.sound.setPlaybackRate(this.sound.playbackRate + 0.02);
      }
    }

    if (this.speedModifier < MINIMUM_SPEED_MODIFIER) {
      this.speedModifier = MINIMUM_SPEED_MODIFIER;
    }
  },

  shiftBlockUp: function() {
    var direction = this.getMovementDirection("up");
    this.moveBlock(direction);
  },

  shiftBlockDown: function() {
    var direction = this.getMovementDirection("down");
    this.moveBlock(direction);
  },

  shiftBlockLeft: function() {
    var direction = this.getMovementDirection("left");
    this.moveBlock(direction);
  },

  shiftBlockRight: function() {
    var direction = this.getMovementDirection("right");
    this.moveBlock(direction);
  },

  getMovementDirection: function(direction) {
    var rot = this.cameraRot;

    if (rot >= Math.PI / 4 && rot < (3 * Math.PI) / 4) {
      return this.getMovementFromSide(direction, "right");
    }

    if (rot >= (3 * Math.PI) / 4 && rot < (5 * Math.PI) / 4) {
      return this.getMovementFromSide(direction, "back");
    }

    if (rot >= (5 * Math.PI) / 4 && rot < (7 * Math.PI) / 4) {
      return this.getMovementFromSide(direction, "left");
    }

    return this.getMovementFromSide(direction, "front");
  },

  getMovementFromSide: function(direction, side) {
    var movementMap = {
      front: {
        up: { axis: "z", offset: -1 },
        down: { axis: "z", offset: 1 },
        left: { axis: "x", offset: -1 },
        right: { axis: "x", offset: 1 }
      },
      right: {
        up: { axis: "x", offset: -1 },
        down: { axis: "x", offset: 1 },
        left: { axis: "z", offset: 1 },
        right: { axis: "z", offset: -1 }
      },
      back: {
        up: { axis: "z", offset: 1 },
        down: { axis: "z", offset: -1 },
        left: { axis: "x", offset: 1 },
        right: { axis: "x", offset: -1 }
      },
      left: {
        up: { axis: "x", offset: 1 },
        down: { axis: "x", offset: -1 },
        left: { axis: "z", offset: -1 },
        right: { axis: "z", offset: 1 }
      }
    };

    return movementMap[side][direction];
  },

  moveBlock: function(movement) {
    if (movement.axis === "x") {
      this.board.shiftBlockX(movement.offset);
    } else {
      this.board.shiftBlockZ(movement.offset);
    }
  },

  dropBlock: function() {
    this.dropCounter = this.dropThreshold;
  },

  rotateBlockX: function() {
    this.board.rotateBlockX();
  },

  rotateBlockY: function() {
    this.board.rotateBlockY();
  },

  rotateBlockZ: function() {
    this.board.rotateBlockZ();
  },

  rotateCamera: function(rotationAmount) {
    this.cameraRot += rotationAmount;

    if (this.cameraRot < 0) {
      this.cameraRot += 2 * Math.PI;
    }

    if (this.cameraRot > 2 * Math.PI) {
      this.cameraRot -= 2 * Math.PI;
    }
  },

  animate: function() {
    var thisGame = this;

    requestAnimationFrame(function() {
      thisGame.animate();
    });

    if (this.keepPlaying && !this.paused) {
      this.updateCameraPosition();
      this.updateGameTime();
    }

    this.renderer.render(this.scene, this.camera);
  },

  updateGameTime: function() {
    this.dropCounter++;

    if (this.dropCounter >= Math.floor(this.dropThreshold * this.speedModifier)) {
      this.dropCounter = 0;
      this.board.advance();
    }
  }
};
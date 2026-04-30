// ----------------------------
// Inicialización de Variables:
// ----------------------------
var scene = null,
  camera = null,
  renderer = null,
  clock = null;

var sound1 = null,
  modelLoad = null,
  light = null,
  figuresGeo = [];

var MovingCube = null,
  collidableMeshList = [],
  islandMeshes = [],
  lives = 3;

var scale = 1;
var spd = 0.08;


var yaw = 0;
var pitch = 0;
var mouseSensitivity = 0.003;
var mouseLookActive = false;


var input = {
  left: 0,
  right: 0,
  up: 0,
  down: 0,
  jump: 0
};


var velocityY = 0;
var gravity = 0.018;
var jumpForce = 0.32;
var isOnGround = true;


var playerHeight = 0.45;


var posX = 5;
var posY = 0.45;
var posZ = 0;


var position1 = [2.5, 0.45, 2.5],
  position2 = [7.5, 0.45, 2.5],
  position3 = [2.5, 0.45, -2.5],
  position4 = [7.5, 0.45, -2.5];

var Ducks = [];


var gui = null;

var gameConfig = {
  ataquePato: false
};

var island = null;

var duckBaseScale = 0.22;
var duckAttackScale = duckBaseScale * 3;

var gameOver = false;
var isPlaying = false;
var canLoseLife = true;

var timerInterval = null;
var worldWalls = null;


var worldLimit = {
  minX: 1,
  maxX: 9,
  minZ: -4,
  maxZ: 4
};


function start() {
  window.onresize = onWindowResize;
  initScene();
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 4);
}

function initScene() {
  initBasicElements();
  initSound();
  createLight();
  initWorld();
  createIsland();
  createPlayerMove();
  createFrontera();
  createGUI();
  initMouseLook();
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  if (sound1 !== null) {
    sound1.update(camera);
  }

  if (!gameOver && isPlaying) {
    movePlayer();
    updateJump();
    checkWorldLimits();
    moveDucks();
  }
}



function initBasicElements() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#app"),
    antialias: true
  });

  clock = new THREE.Clock();

  scene.background = new THREE.Color(0x0099ff);
  scene.fog = new THREE.Fog(0xffffff, 25, 150);

  renderer.setSize(window.innerWidth, window.innerHeight - 4);
  document.body.appendChild(renderer.domElement);

  camera.rotation.order = "YXZ";
  camera.position.set(posX, posY, posZ);
  camera.rotation.set(0, 0, 0);
}

function initSound() {
  sound1 = new Sound(["./songs/rain.mp3"], 500, scene, {
    debug: true,
    position: {
      x: camera.position.x,
      y: camera.position.y + 10,
      z: camera.position.z
    }
  });
}


function createLight() {
  var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  var ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(10, 20, 10);
  scene.add(light);
}


function initMouseLook() {
  var canvas = document.getElementById("app");

  canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

  canvas.addEventListener("mousedown", function (event) {
    if (!isPlaying) return;

    if (event.button === 2) {
      mouseLookActive = true;
    }
  });

  window.addEventListener("mouseup", function (event) {
    if (event.button === 2) {
      mouseLookActive = false;
    }
  });

  window.addEventListener("mousemove", function (event) {
    if (!isPlaying) return;
    if (!mouseLookActive) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yaw -= movementX * mouseSensitivity;
    pitch -= movementY * mouseSensitivity;

    var limit = Math.PI / 2 - 0.1;

    if (pitch > limit) pitch = limit;
    if (pitch < -limit) pitch = -limit;

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  });
}


function createIsland() {
  var generalPath = "./modelos/island/";
  var pathMtl = "littleisle.mtl";
  var pathObj = "littleisle.obj";

  console.log("Intentando cargar isla:");
  console.log(generalPath + pathObj);
  console.log(generalPath + pathMtl);

  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setTexturePath(generalPath);
  mtlLoader.setPath(generalPath);

  mtlLoader.load(
    pathMtl,

    function (materials) {
      materials.preload();

      var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(generalPath);

      objLoader.load(
        pathObj,

        function (object) {
          console.log("Isla cargada con materiales.");
          prepareIsland(object);
        },

        function (xhr) {
          if (xhr.total > 0) {
            console.log("OBJ isla: " + (xhr.loaded / xhr.total * 100) + "% cargado");
          }
        },

        function (error) {
          console.log("No cargó el OBJ con materiales.");
          console.log(error);
          console.log("Intentando cargar solo el OBJ...");
          loadIslandWithoutMTL();
        }
      );
    },

    function (xhr) {
      if (xhr.total > 0) {
        console.log("MTL isla: " + (xhr.loaded / xhr.total * 100) + "% cargado");
      }
    },

    function (error) {
      console.log("No cargó el MTL.");
      console.log(error);
      console.log("Intentando cargar solo el OBJ...");
      loadIslandWithoutMTL();
    }
  );

  function loadIslandWithoutMTL() {
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath(generalPath);

    objLoader.load(
      pathObj,

      function (object) {
        console.log("Isla cargada sin materiales.");

        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshLambertMaterial({
              color: 0x55aa55,
              side: THREE.DoubleSide
            });
          }
        });

        prepareIsland(object);
      },

      function (xhr) {
        if (xhr.total > 0) {
          console.log("OBJ isla sin MTL: " + (xhr.loaded / xhr.total * 100) + "% cargado");
        }
      },

      function (error) {
        console.log("ERROR: No se pudo cargar littleisle.obj.");
        console.log(error);
        createEmergencyIsland();
      }
    );
  }

  function prepareIsland(object) {
    island = new THREE.Group();
    island.add(object);
    scene.add(island);

    islandMeshes = [];

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.needsUpdate = true;
        }

        islandMeshes.push(child);
      }
    });

    var box = new THREE.Box3().setFromObject(object);
    var size = new THREE.Vector3();
    var center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    object.position.x -= center.x;
    object.position.y -= center.y;
    object.position.z -= center.z;

    var maxSize = Math.max(size.x, size.y, size.z);

    if (maxSize === 0 || isNaN(maxSize)) {
      maxSize = 1;
    }

    
    var desiredSize = 11;
    var finalScale = desiredSize / maxSize;

    island.scale.set(finalScale, finalScale, finalScale);

    var finalBox = new THREE.Box3().setFromObject(island);
    var yOffset = -finalBox.min.y;

    
    island.position.set(5, yOffset, 0);

    console.log("Isla preparada correctamente.");
    console.log("Escala final isla:", finalScale);
    console.log("Posición final isla:", island.position);

    
    placePlayerOnIsland();
  }

  function createEmergencyIsland() {
    console.log("Creando isla de emergencia porque no cargó littleisle.obj.");

    var geometry = new THREE.CylinderGeometry(5.5, 6, 1, 32);
    var material = new THREE.MeshLambertMaterial({
      color: 0x55aa55,
      side: THREE.DoubleSide
    });

    island = new THREE.Mesh(geometry, material);
    island.position.set(5, -0.5, 0);
    scene.add(island);

    islandMeshes = [island];

    var waterGeometry = new THREE.CircleGeometry(8, 32);
    var waterMaterial = new THREE.MeshLambertMaterial({
      color: 0x0066ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });

    var water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(5, -0.55, 0);
    scene.add(water);

    placePlayerOnIsland();
  }
}


function getIslandHeightAt(x, z) {
  if (islandMeshes.length === 0) {
    return 0;
  }

  
  scene.updateMatrixWorld(true);

  var rayOrigin = new THREE.Vector3(x, 50, z);
  var rayDirection = new THREE.Vector3(0, -1, 0);
  var raycaster = new THREE.Raycaster(rayOrigin, rayDirection);

  var intersections = raycaster.intersectObjects(islandMeshes, true);

  if (intersections.length > 0) {
    return intersections[0].point.y;
  }

  return 0;
}

function placePlayerOnIsland() {
 
  posX = 5;
  posZ = 0;

  var groundY = getIslandHeightAt(posX, posZ);

 
  posY = groundY + playerHeight;

  camera.position.set(posX, posY, posZ);
  camera.rotation.order = "YXZ";
  camera.rotation.set(0, 0, 0);

  if (MovingCube) {
    MovingCube.position.set(posX, posY, posZ);
  }

  console.log("Suelo de la isla Y:", groundY);
  console.log("Jugador colocado sobre la isla Y:", posY);
}


function createGUI() {
  gui = new dat.GUI();

  gui.add(gameConfig, "ataquePato")
    .name("Ataque de pato")
    .onChange(function (value) {
      changeDuckAttack(value);
    });
}

function changeDuckAttack(active) {
  var newScale = active ? duckAttackScale : duckBaseScale;

  for (var i = 0; i < Ducks.length; i++) {
    if (Ducks[i]) {
      Ducks[i].scale.set(newScale, newScale, newScale);
    }
  }
}


function createGltfFunction(generalPath, pathGltf, position, indice, scale) {
  const loader = new THREE.GLTFLoader();

  console.log("This is my Duck " + indice);

  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath(generalPath);
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    pathGltf,

    function (gltf) {
      Ducks[indice] = gltf.scene;
      scene.add(gltf.scene);

      var finalScale = gameConfig.ataquePato ? duckAttackScale : scale;

      gltf.scene.scale.set(finalScale, finalScale, finalScale);
      gltf.scene.position.set(position[0], position[1], position[2]);

      console.log("Pato cargado:", indice);
    },

    function (xhr) {
      if (xhr.total > 0) {
        console.log("Duck: " + (xhr.loaded / xhr.total * 100) + "% loaded");
      }
    },

    function (error) {
      console.log("Error cargando pato.");
      console.log(error);
    }
  );
}

function initWorld() {
  var positionFather = [position1, position2, position3, position4];

  for (var i = 0; i < 4; i++) {
    createGltfFunction(
      "./modelos/other/",
      "./modelos/other/Duck.gltf",
      positionFather[i],
      i,
      duckBaseScale
    );
  }
}

function moveDucks() {
  if (Ducks.length > 0) {
    if (Ducks[0]) Ducks[0].rotation.y += 0.02;
    if (Ducks[1]) Ducks[1].rotation.y += 0.02;
    if (Ducks[2]) Ducks[2].rotation.y += 0.02;
    if (Ducks[3]) Ducks[3].rotation.y += 0.02;
  }
}



function movePlayer() {
  if (!MovingCube) return;

  var moveX = 0;
  var moveZ = 0;

  var forwardX = -Math.sin(yaw);
  var forwardZ = -Math.cos(yaw);

  var rightX = Math.cos(yaw);
  var rightZ = -Math.sin(yaw);

  if (input.up == 1) {
    moveX += forwardX * spd;
    moveZ += forwardZ * spd;
  }

  if (input.down == 1) {
    moveX -= forwardX * spd;
    moveZ -= forwardZ * spd;
  }

  if (input.right == 1) {
    moveX += rightX * spd;
    moveZ += rightZ * spd;
  }

  if (input.left == 1) {
    moveX -= rightX * spd;
    moveZ -= rightZ * spd;
  }

  var nextX = camera.position.x + moveX;
  var nextZ = camera.position.z + moveZ;

  camera.position.x = nextX;
  camera.position.z = nextZ;


  if (isOnGround) {
    var groundY = getIslandHeightAt(camera.position.x, camera.position.z);
    camera.position.y = groundY + playerHeight;
  }

  MovingCube.position.x = camera.position.x;
  MovingCube.position.y = camera.position.y;
  MovingCube.position.z = camera.position.z;
}


function updateJump() {
  if (input.jump == 1 && isOnGround) {
    velocityY = jumpForce;
    isOnGround = false;
  }

  if (!isOnGround) {
    camera.position.y += velocityY;
    velocityY -= gravity;

    var groundY = getIslandHeightAt(camera.position.x, camera.position.z);
    var minY = groundY + playerHeight;

    if (camera.position.y <= minY) {
      camera.position.y = minY;
      velocityY = 0;
      isOnGround = true;
    }
  }

  if (MovingCube) {
    MovingCube.position.y = camera.position.y;
  }
}


window.addEventListener("keydown", function (e) {
  switch (e.keyCode) {
    case 68:
      input.right = 1;
      break;

    case 65: 
      input.left = 1;
      break;

    case 87:
      input.up = 1;
      break;

    case 83:
      input.down = 1;
      break;

    case 32: 
      input.jump = 1;
      e.preventDefault();
      break;

    case 27: 
      document.getElementById("blocker").style.display = "block";
      isPlaying = false;
      mouseLookActive = false;
      break;
  }
});

window.addEventListener("keyup", function (e) {
  switch (e.keyCode) {
    case 68: 
      input.right = 0;
      break;

    case 65: 
      input.left = 0;
      break;

    case 87:
      input.up = 0;
      break;

    case 83: 
      input.down = 0;
      break;

    case 32: 
      input.jump = 0;
      e.preventDefault();
      break;
  }
});


function go2Play() {
  gameOver = false;
  isPlaying = true;
  lives = 3;
  canLoseLife = false;

  yaw = 0;
  pitch = 0;
  velocityY = 0;
  isOnGround = true;
  mouseLookActive = false;

  placePlayerOnIsland();

  document.getElementById("lost").style.display = "none";
  document.getElementById("blocker").style.display = "none";
  document.getElementById("cointainerOthers").style.display = "block";
  document.getElementById("lives").innerHTML = lives;

  pauseAudio(y);
  playAudio(x);

  initialiseTimer();

  setTimeout(function () {
    canLoseLife = true;
  }, 800);
}

function initialiseTimer() {
  var sec = 0;

  if (timerInterval !== null) {
    clearInterval(timerInterval);
  }

  function pad(val) {
    return val > 9 ? val : "0" + val;
  }

  document.getElementById("seconds").innerHTML = "00";
  document.getElementById("minutes").innerHTML = "00";

  timerInterval = setInterval(function () {
    document.getElementById("seconds").innerHTML = String(pad(++sec % 60));
    document.getElementById("minutes").innerHTML = String(pad(parseInt(sec / 60, 10)));
  }, 1000);
}

function createPlayerMove() {
  var cubeGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);

  var wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.0
  });

  MovingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
  MovingCube.position.set(camera.position.x, camera.position.y, camera.position.z);

  scene.add(MovingCube);
}


function createFrontera() {
  var cubeGeometry = new THREE.CubeGeometry(8, 5, 8, 1, 1, 1);

  var wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: true,
    transparent: true,
    opacity: 0.0
  });

  worldWalls = new THREE.Mesh(cubeGeometry, wireMaterial);
  worldWalls.position.set(5, 0, 0);

  scene.add(worldWalls);
  collidableMeshList.push(worldWalls);
}


function checkWorldLimits() {
  if (gameOver) return;
  if (!isPlaying) return;
  if (!canLoseLife) return;

  var outside =
    camera.position.x < worldLimit.minX ||
    camera.position.x > worldLimit.maxX ||
    camera.position.z < worldLimit.minZ ||
    camera.position.z > worldLimit.maxZ;

  if (outside) {
    loseLife();
  }
}

function loseLife() {
  canLoseLife = false;

  lives--;

  document.getElementById("lives").innerHTML = lives;

  if (lives <= 0) {
    endGameScreen();
    return;
  }

  yaw = 0;
  pitch = 0;
  velocityY = 0;
  isOnGround = true;
  mouseLookActive = false;

  placePlayerOnIsland();

  setTimeout(function () {
    canLoseLife = true;
  }, 1000);
}

function endGameScreen() {
  gameOver = true;
  isPlaying = false;
  mouseLookActive = false;

  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  document.getElementById("lost").style.display = "block";
  document.getElementById("blocker").style.display = "none";
  document.getElementById("cointainerOthers").style.display = "none";

  pauseAudio(x);
  playAudio(y);
}

function collisionAnimate() {
  var originPoint = MovingCube.position.clone();

  for (var vertexIndex = 0; vertexIndex < MovingCube.geometry.vertices.length; vertexIndex++) {
    var localVertex = MovingCube.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(MovingCube.matrix);
    var directionVector = globalVertex.sub(MovingCube.position);

    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(collidableMeshList);

    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      document.getElementById("lives").innerHTML = lives;
    } else {
      document.getElementById("lives").innerHTML = lives;
    }
  }
}
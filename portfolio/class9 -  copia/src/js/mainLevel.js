import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b0f0f);
scene.fog = new THREE.Fog(0x1b0f0f, 20, 80);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);

const container = document.getElementById('container') || document.body;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

camera.position.set(0, 8, 18);
camera.lookAt(0, 4, 0);

const hemiLight = new THREE.HemisphereLight(0xbfdfff, 0x2b1b14, 0.35);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffe2b8, 0.45);
directionalLight.position.set(12, 18, 10);
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0x8db5ff, 0.2);
fillLight.position.set(-10, 8, -8);
scene.add(fillLight);

let currentLight = new THREE.DirectionalLight(0xd7b26d, 2);
currentLight.position.set(2, 6, 2);
scene.add(currentLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({
    color: 0x4a535c,
    roughness: 1
  })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.5;
scene.add(ground);

let castleModel = null;
let modelCenter = new THREE.Vector3();
let modelSize = new THREE.Vector3();

let baseCameraY = 8;
let baseCameraZ = 18;
let autoCamera = true;
let currentControlMode = 'Auto';

const description = {
  Auto: 'Cámara cinematográfica automática alrededor del castillo de Imperio.',
  Orbit: 'Permite rotar alrededor del castillo, hacer zoom y explorar el modelo.',
  Fly: 'Permite volar libremente por la escena.',
  FirstPerson: 'Simula movimiento en primera persona.',
  PointerLock: 'Control inmersivo en primera persona bloqueando el cursor.',
  Trackball: 'Exploración libre con sensación más fluida.'
};

const titleElement = document.getElementById('control-title');
const descElement = document.getElementById('control-desc');

function updateControlInfo(key) {
  if (titleElement) titleElement.textContent = `${key} Controls`;
  if (descElement) descElement.textContent = description[key] || 'Descripción no disponible.';
}

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.enabled = false;

const flyControls = new FlyControls(camera, renderer.domElement);
flyControls.movementSpeed = 8;
flyControls.rollSpeed = Math.PI / 24;
flyControls.dragToLook = true;
flyControls.enabled = false;

const firstPersonControls = new FirstPersonControls(camera, renderer.domElement);
firstPersonControls.movementSpeed = 8;
firstPersonControls.lookSpeed = 0.08;
firstPersonControls.enabled = false;

const pointerLockControls = new PointerLockControls(camera, document.body);

const trackballControls = new TrackballControls(camera, renderer.domElement);
trackballControls.rotateSpeed = 4.0;
trackballControls.zoomSpeed = 1.2;
trackballControls.panSpeed = 0.8;
trackballControls.enabled = false;

function disableAllControls() {
  orbitControls.enabled = false;
  flyControls.enabled = false;
  firstPersonControls.enabled = false;
  trackballControls.enabled = false;

  if (document.pointerLockElement === document.body) {
    document.exitPointerLock();
  }
}

function setControls(mode) {
  currentControlMode = mode;
  disableAllControls();

  if (mode === 'Auto') {
    autoCamera = true;
    updateControlInfo('Auto');
    return;
  }

  autoCamera = false;

  switch (mode) {
    case 'Orbit':
      orbitControls.enabled = true;
      break;

    case 'Fly':
      flyControls.enabled = true;
      break;

    case 'FirstPerson':
      firstPersonControls.enabled = true;
      break;

    case 'PointerLock':
      pointerLockControls.lock();
      break;

    case 'Trackball':
      trackballControls.enabled = true;
      break;
  }

  updateControlInfo(mode);
}

function disableAutoCameraFromGUI() {
  autoCamera = false;
  params.autoCamera = false;
  if (params.controlMode === 'Auto') {
    params.controlMode = 'Orbit';
  }
}

function fitCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());

  object.position.x -= center.x;
  object.position.y -= box.min.y;
  object.position.z -= center.z;

  const box2 = new THREE.Box3().setFromObject(object);
  modelCenter = box2.getCenter(new THREE.Vector3());
  modelSize = box2.getSize(new THREE.Vector3());

  const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
  const fov = camera.fov * (Math.PI / 180);
  const cameraDistance = (maxDim / 2) / Math.tan(fov / 2);

  baseCameraY = modelCenter.y + modelSize.y * 0.45;
  baseCameraZ = modelCenter.z + cameraDistance * 1.45;

  camera.position.set(
    modelCenter.x,
    baseCameraY,
    baseCameraZ
  );

  const targetY = modelCenter.y + modelSize.y * 0.25;

  camera.lookAt(modelCenter.x, targetY, modelCenter.z);

  orbitControls.target.set(modelCenter.x, targetY, modelCenter.z);
  orbitControls.update();

  trackballControls.target.set(modelCenter.x, targetY, modelCenter.z);
}

function resetImperioCamera() {
  if (!castleModel) return;

  autoCamera = true;
  params.autoCamera = true;
  params.controlMode = 'Auto';
  setControls('Auto');

  fitCameraToObject(castleModel);
}

async function loadScene() {
  try {
    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    const gltf = await loader.loadAsync('../src/models/glb/castillo.glb');
    castleModel = gltf.scene;

    castleModel.rotation.y = Math.PI;

    castleModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;

        if (child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.needsUpdate = true;
        }
      }
    });

    scene.add(castleModel);
    fitCameraToObject(castleModel);

  } catch (error) {
    console.error('Error cargando castillo.glb:', error);
  }
}

loadScene();

const gui = new GUI();

const params = {
  controlMode: 'Auto',
  autoCamera: true,
  lightType: 'Directional',
  enabled: true,
  intensity: 2,
  color: '#d7b26d',
  positionX: 2,
  positionY: 6,
  positionZ: 2,
  resetCamera: () => resetImperioCamera()
};

function changeTypeLight(typeLight) {
  scene.remove(currentLight);

  switch (typeLight) {
    case 'Hemisphere':
      currentLight = new THREE.HemisphereLight(params.color, 0x3a1712, params.intensity);
      currentLight.position.set(params.positionX, params.positionY, params.positionZ);
      break;

    case 'Directional':
      currentLight = new THREE.DirectionalLight(params.color, params.intensity);
      currentLight.position.set(params.positionX, params.positionY, params.positionZ);
      break;

    case 'Ambient':
      currentLight = new THREE.AmbientLight(params.color, params.intensity);
      break;

    default:
      currentLight = new THREE.DirectionalLight(params.color, params.intensity);
      currentLight.position.set(params.positionX, params.positionY, params.positionZ);
      break;
  }

  currentLight.visible = params.enabled;
  scene.add(currentLight);
}

const lightFolder = gui.addFolder('Light');
lightFolder.close();

lightFolder
  .add(params, 'lightType', ['Hemisphere', 'Directional', 'Ambient'])
  .name('Light Type')
  .onChange((value) => {
    changeTypeLight(value);
    updateLightControllers();
  });

lightFolder
  .add(params, 'enabled')
  .name('Light Enabled')
  .onChange((value) => {
    currentLight.visible = value;
  });

lightFolder
  .add(params, 'intensity', 0, 4, 0.1)
  .name('Light Intensity')
  .onChange((value) => {
    currentLight.intensity = value;
  });

lightFolder
  .addColor(params, 'color')
  .name('Light Color')
  .onChange((value) => {
    if (currentLight.color) currentLight.color.set(value);
  });

const posXCtrl = lightFolder
  .add(params, 'positionX', -20, 20, 0.1)
  .name('Position X')
  .onChange((value) => {
    if (currentLight.position) currentLight.position.x = value;
  });

const posYCtrl = lightFolder
  .add(params, 'positionY', -20, 20, 0.1)
  .name('Position Y')
  .onChange((value) => {
    if (currentLight.position) currentLight.position.y = value;
  });

const posZCtrl = lightFolder
  .add(params, 'positionZ', -20, 20, 0.1)
  .name('Position Z')
  .onChange((value) => {
    if (currentLight.position) currentLight.position.z = value;
  });

function updateLightControllers() {
  const showPosition = params.lightType !== 'Ambient';

  posXCtrl.domElement.style.display = showPosition ? '' : 'none';
  posYCtrl.domElement.style.display = showPosition ? '' : 'none';
  posZCtrl.domElement.style.display = showPosition ? '' : 'none';
}

changeTypeLight(params.lightType);
updateLightControllers();

const cameraFolder = gui.addFolder('Camera Position');
cameraFolder
  .add(camera.position, 'x', -50, 50, 0.1)
  .name('Position X')
  .onChange(() => {
    disableAutoCameraFromGUI();
    disableAllControls();
  });

cameraFolder
  .add(camera.position, 'y', -50, 50, 0.1)
  .name('Position Y')
  .onChange(() => {
    disableAutoCameraFromGUI();
    disableAllControls();
  });

cameraFolder
  .add(camera.position, 'z', -50, 50, 0.1)
  .name('Position Z')
  .onChange(() => {
    disableAutoCameraFromGUI();
    disableAllControls();
  });

cameraFolder.close();

const cameraFolder2 = gui.addFolder('Camera Rotation');
cameraFolder2
  .add(camera.rotation, 'x', -Math.PI, Math.PI, 0.01)
  .name('Rotation X')
  .onChange(() => {
    disableAutoCameraFromGUI();
    disableAllControls();
  });

cameraFolder2
  .add(camera.rotation, 'y', -Math.PI, Math.PI, 0.01)
  .name('Rotation Y')
  .onChange(() => {
    disableAutoCameraFromGUI();
    disableAllControls();
  });

cameraFolder2
  .add(camera.rotation, 'z', -Math.PI, Math.PI, 0.01)
  .name('Rotation Z')
  .onChange(() => {
    disableAutoCameraFromGUI();
    disableAllControls();
  });

cameraFolder2.close();

const controlsFolder = gui.addFolder('Controls');
controlsFolder
  .add(params, 'autoCamera')
  .name('Auto Camera')
  .onChange((value) => {
    autoCamera = value;

    if (value) {
      params.controlMode = 'Auto';
      setControls('Auto');
      if (castleModel) fitCameraToObject(castleModel);
    }
  });

controlsFolder
  .add(params, 'controlMode', ['Auto', 'Orbit', 'Trackball', 'Fly', 'FirstPerson', 'PointerLock'])
  .name('Mode')
  .onChange((value) => {
    if (value === 'Auto') {
      params.autoCamera = true;
      autoCamera = true;
    } else {
      params.autoCamera = false;
      autoCamera = false;
    }
    setControls(value);
  });

controlsFolder
  .add(params, 'resetCamera')
  .name('Reset Camera');

controlsFolder.open();

updateControlInfo('Auto');

function animate() {
  const delta = clock.getDelta();
  const t = performance.now() * 0.0003;

  if (castleModel && autoCamera) {
    camera.position.x = modelCenter.x + Math.sin(t) * 1.5;
    camera.position.y = baseCameraY + Math.sin(t * 1.7) * 0.2;
    camera.position.z = baseCameraZ + Math.cos(t) * 0.8;

    camera.lookAt(
      modelCenter.x,
      modelCenter.y + modelSize.y * 0.25,
      modelCenter.z
    );
  }

  if (orbitControls.enabled) orbitControls.update();
  if (flyControls.enabled) flyControls.update(delta);
  if (firstPersonControls.enabled) firstPersonControls.update(delta);
  if (trackballControls.enabled) trackballControls.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  orbitControls.update();
  trackballControls.handleResize();
}

window.addEventListener('load', function () {
  const audio = document.getElementById('miAudio2');

  if (!audio) return;

  const reproducir = function () {
    audio.play().then(function () {
      document.removeEventListener('click', reproducir);
      document.removeEventListener('keydown', reproducir);
    }).catch(function () {
      console.log('Esperando interacción real...');
    });
  };

  document.addEventListener('click', reproducir);
  document.addEventListener('keydown', reproducir);
});
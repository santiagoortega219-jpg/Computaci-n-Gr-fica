import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const timer = new THREE.Timer();
timer.connect(document);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b0f0f);
scene.fog = new THREE.Fog(0x1b0f0f, 20, 80);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setAnimationLoop(animate);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// CAMERA INICIAL
camera.position.set(0, 8, 18);
camera.lookAt(0, 4, 0);

// LUCES
const hemiLight = new THREE.HemisphereLight(0xbfdfff, 0x2b1b14, 1.8);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffe2b8, 2);
directionalLight.position.set(12, 18, 10);
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0x8db5ff, 0.9);
fillLight.position.set(-10, 8, -8);
scene.add(fillLight);

// SUELO PARA DAR REFERENCIA VISUAL
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

// FUNCION PARA CENTRAR Y AJUSTAR CAMARA
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

  camera.lookAt(
    modelCenter.x,
    modelCenter.y + modelSize.y * 0.25,
    modelCenter.z
  );
}

async function loadScene() {
  try {
    const loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    const gltf = await loader.loadAsync('../src/models/glb/castillo.glb');
    castleModel = gltf.scene;

    // GIRO DEL MODELO DE FRENTE
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

function animate() {
  timer.update();

  const t = performance.now() * 0.0003;

  if (castleModel) {
    camera.position.x = modelCenter.x + Math.sin(t) * 1.5;
    camera.position.y = baseCameraY + Math.sin(t * 1.7) * 0.2;
    camera.position.z = baseCameraZ + Math.cos(t) * 0.8;

    camera.lookAt(
      modelCenter.x,
      modelCenter.y + modelSize.y * 0.25,
      modelCenter.z
    );
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// AUDIO
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
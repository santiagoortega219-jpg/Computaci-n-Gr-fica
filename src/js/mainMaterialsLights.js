import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f9fa);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);


const geometry = new THREE.BoxGeometry(1, 1, 1);


const loader = new THREE.TextureLoader();


const material = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.5,
  wireframe: false
});


const materialStand = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  roughness: 0.5,
  metalness: 1.0,
  transparent: false
});


const materialPhong = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  specular: 0xffffff,
  shininess: 30,
  side: THREE.DoubleSide,
  map: loader.load('../../portfolio/clase 6/img/uv_test_bw_1024.png')
});


const materialCube = [
  new THREE.MeshStandardMaterial({
    map: loader.load('../../portfolio/clase 6/img/face1.jpg'),
    side: THREE.DoubleSide
  }),
  new THREE.MeshStandardMaterial({
    map: loader.load('../../portfolio/clase 6/img/face2.png'),
    side: THREE.DoubleSide
  }),
  new THREE.MeshStandardMaterial({
    map: loader.load('../../portfolio/clase 6/img/face3.jpg'),
    side: THREE.DoubleSide
  }),
  new THREE.MeshStandardMaterial({
    map: loader.load('../../portfolio/clase 6/img/face4.jpg'),
    side: THREE.DoubleSide
  }),
  new THREE.MeshStandardMaterial({
    map: loader.load('../../portfolio/clase 6/img/face5.png'),
    side: THREE.DoubleSide
  }),
  new THREE.MeshStandardMaterial({
    map: loader.load('../../portfolio/clase 6/img/face6.jpg'),
    side: THREE.DoubleSide
  })
];


const materialLambert = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  map: loader.load('../../portfolio/clase 6/img/face1.jpg')
});


const materialNormal = new THREE.MeshNormalMaterial();


const materialToon = new THREE.MeshToonMaterial({
  color: 0xffaa00
});


const materialPhysical = new THREE.MeshPhysicalMaterial({
  color: 0x00ff88,
  roughness: 0.3,
  metalness: 0.7,
  clearcoat: 1.0
});


const materialBasicWire = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true
});


const materialTexture2 = new THREE.MeshStandardMaterial({
  map: loader.load('../../portfolio/clase 6/img/face2.png'),
  side: THREE.DoubleSide
});


const cube1 = new THREE.Mesh(geometry, material);
const cube2 = new THREE.Mesh(geometry, materialStand);
const cube3 = new THREE.Mesh(geometry, materialPhong);
const cube4 = new THREE.Mesh(geometry, materialCube);
const cube5 = new THREE.Mesh(geometry, materialLambert);
const cube6 = new THREE.Mesh(geometry, materialNormal);
const cube7 = new THREE.Mesh(geometry, materialToon);
const cube8 = new THREE.Mesh(geometry, materialPhysical);
const cube9 = new THREE.Mesh(geometry, materialBasicWire);
const cube10 = new THREE.Mesh(geometry, materialTexture2);


cube1.position.set(-6, 0, 0);
cube2.position.set(-4.5, 0, 0);
cube3.position.set(-3, 0, 0);
cube4.position.set(-1.5, 0, 0);
cube5.position.set(0, 0, 0);
cube6.position.set(1.5, 0, 0);
cube7.position.set(3, 0, 0);
cube8.position.set(4.5, 0, 0);
cube9.position.set(6, 0, 0);
cube10.position.set(7.5, 0, 0);


scene.add(cube1);
scene.add(cube2);
scene.add(cube3);
scene.add(cube4);
scene.add(cube5);
scene.add(cube6);
scene.add(cube7);
scene.add(cube8);
scene.add(cube9);
scene.add(cube10);


const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 8);
controls.update();


const size = 20;
const divisions = 20;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


function animate() {
  cube1.rotation.x += 0.01;
  cube1.rotation.y += 0.01;

  cube2.rotation.x += 0.01;
  cube2.rotation.y += 0.01;

  cube3.rotation.x += 0.01;
  cube3.rotation.y += 0.01;

  cube4.rotation.x += 0.01;
  cube4.rotation.y += 0.01;

  cube5.rotation.x += 0.01;
  cube5.rotation.y += 0.01;

  cube6.rotation.x += 0.01;
  cube6.rotation.y += 0.01;

  cube7.rotation.x += 0.01;
  cube7.rotation.y += 0.01;

  cube8.rotation.x += 0.01;
  cube8.rotation.y += 0.01;

  cube9.rotation.x += 0.01;
  cube9.rotation.y += 0.01;

  cube10.rotation.x += 0.01;
  cube10.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
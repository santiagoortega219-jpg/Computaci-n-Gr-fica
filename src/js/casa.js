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
camera.position.set(8, 6, 8);


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


const house = new THREE.Group();
house.position.y = 1.5; 
scene.add(house);


const baseGeometry = new THREE.BoxGeometry(4, 3, 4);
const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xffd89c });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
house.add(base);


const roofGeometry = new THREE.ConeGeometry(3.2, 2, 4);
const roofMaterial = new THREE.MeshBasicMaterial({ color: 0xb22222 });
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.y = 2.5;
roof.rotation.y = Math.PI / 4;
house.add(roof);


const doorGeometry = new THREE.BoxGeometry(1, 1.8, 0.2);
const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x5c3317 });
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, -0.6, 2.1);
house.add(door);


const windowGeometry = new THREE.BoxGeometry(1, 1, 0.2);
const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb });
const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
windowMesh.position.set(-1.2, 0.5, 2.1);
house.add(windowMesh);


const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


function animate(time) {

  house.rotation.y = time / 2000; 

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
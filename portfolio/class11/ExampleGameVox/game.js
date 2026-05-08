import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// --- 1. CONFIGURACIÓN DE ESCENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Cielo
scene.fog = new THREE.Fog(0x87ceeb, 0, 60);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Posicionamos al jugador en el centro del mapa
camera.position.set(16, 1.7, 16); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- 2. ILUMINACIÓN ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(50, 100, 50);
scene.add(sunLight);

// --- 3. GENERACIÓN DEL MAPA DE VOXELS ---
const mapSize = 32;
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

// Colores para los voxels (estilo tierra/pasto)
const grassMat = new THREE.MeshStandardMaterial({ color: 0x4e9c3e });
const dirtMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

function createVoxelMap() {
    for (let x = 0; x < mapSize; x++) {
        for (let z = 0; z < mapSize; z++) {
            // Generamos una altura aleatoria simple
            const height = Math.floor(Math.random() * 3) + 1;
            
            for (let y = 0; y < height; y++) {
                const material = (y === height - 1) ? grassMat : dirtMat;
                const voxel = new THREE.Mesh(boxGeo, material);
                voxel.position.set(x, y, z);
                scene.add(voxel);
            }
        }
    }
}
createVoxelMap();

// --- 4. CONTROLES FPS ---
const controls = new PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');

blocker.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => blocker.style.display = 'none');
controls.addEventListener('unlock', () => blocker.style.display = 'flex');

// --- 5. LÓGICA DE MOVIMIENTO ---
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = (e) => {
    switch (e.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
    }
};

const onKeyUp = (e) => {
    switch (e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// --- 6. BUCLE DE ANIMACIÓN ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const delta = clock.getDelta();

        // 1. Aumentamos la fricción (antes era 10, ahora 15 para frenar más rápido)
        velocity.x -= velocity.x * 15.0 * delta;
        velocity.z -= velocity.z * 15.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        // 2. Reducimos drásticamente la fuerza de impulso (de 400 a 100 o 150)
        // Esto es lo que evita que salgas disparado
        const speed = 150.0; 

        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        camera.position.y = 1.7; 
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
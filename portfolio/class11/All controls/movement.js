import * as THREE from 'three';
import { GUI } from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

// --- 1. CONFIGURACIÓN DE DESCRIPCIONES ---
const descriptions = {
    Orbit: "Rotación alrededor de un objetivo fijo. (Click Izq: Rotar | Der: Pan | Scroll: Zoom).",
    Trackball: "Navegación libre sin restricciones polares. Permite giros en cualquier ángulo.",
    Fly: "Simulador de vuelo. W/S: Avanzar/Retroceder. Mouse: Dirección y Alabeo.",
    FirstPerson: "Navegación tipo recorrido. El movimiento se mantiene nivelado al suelo.",
    PointerLock: "Estilo juego FPS. El mouse se oculta. Haz clic para entrar y ESC para salir.",
    Transform: "Manipulación de objetos. Selecciona flechas para mover el cubo (Orbit activo para rotar vista)."
};

// --- 2. ESCENA, CÁMARA Y RENDERER ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Elementos visuales
scene.add(new THREE.GridHelper(50, 50, 0x444444, 0x222222));
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 100);
light.position.set(5, 10, 5);
scene.add(light);

// Objeto principal para TransformControls
const box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0xff0055 })
);
box.position.y = 1.5;
scene.add(box);

// --- 3. INICIALIZACIÓN DE CONTROLES ---
const controlsMap = {
    Orbit: new OrbitControls(camera, renderer.domElement),
    Trackball: new TrackballControls(camera, renderer.domElement),
    Fly: new FlyControls(camera, renderer.domElement),
    FirstPerson: new FirstPersonControls(camera, renderer.domElement),
    PointerLock: new PointerLockControls(camera, document.body),
    Transform: new TransformControls(camera, renderer.domElement)
};

// Configuración específica
controlsMap.Fly.movementSpeed = 10;
controlsMap.Fly.rollSpeed = 0.5;
controlsMap.FirstPerson.movementSpeed = 10;
controlsMap.FirstPerson.lookSpeed = 0.08;
controlsMap.Transform.attach(box);

// Desactivamos Orbit mientras se arrastra el Gizmo
controlsMap.Transform.addEventListener('dragging-changed', (event) => {
    controlsMap.Orbit.enabled = !event.value;
});

// --- 4. GESTIÓN DE INTERFAZ Y CAMBIO ---
let activeControlKey = 'Orbit';
const titleEl = document.getElementById('control-title');
const descEl = document.getElementById('control-desc');
const instructionDiv = document.getElementById('instructions');

function setControl(key) {
    // Apagar todos los controles
    Object.keys(controlsMap).forEach(k => {
        const c = controlsMap[k];
        if (c.enabled !== undefined) c.enabled = false;
        if (k === 'Transform') scene.remove(c);
    });

    activeControlKey = key;
    const active = controlsMap[key];
    
    // Actualizar UI
    if (titleEl) titleEl.innerText = key + "Controls";
    if (descEl) descEl.innerText = descriptions[key];
    if (instructionDiv) instructionDiv.style.display = (key === 'PointerLock') ? 'block' : 'none';

    // Lógica de activación
    if (key === 'Transform') {
        scene.add(active);
        active.enabled = true; 
        controlsMap.Orbit.enabled = true; // Orbit activo para navegar mientras editas
    } else if (key === 'PointerLock') {
        // No se activa .enabled, requiere clic del usuario (ver event listener abajo)
    } else {
        if (active.enabled !== undefined) active.enabled = true;
    }
}

// Evento especial para capturar mouse en PointerLock
renderer.domElement.addEventListener('click', () => {
    if (activeControlKey === 'PointerLock') {
        controlsMap.PointerLock.lock();
    }
});

// --- 5. LÓGICA DE MOVIMIENTO TECLADO (Para PointerLock) ---
const keys = { w: false, a: false, s: false, d: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

window.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });

// --- 6. GUI Y BUCLE DE ANIMACIÓN ---
const gui = new GUI({ title: 'Menú de Controles' });
gui.add({ Script: 'Orbit' }, 'Script', Object.keys(controlsMap)).onChange(setControl);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Actualizar según control activo
    if (activeControlKey === 'Orbit') controlsMap.Orbit.update();
    if (activeControlKey === 'Trackball') controlsMap.Trackball.update();
    if (activeControlKey === 'Fly') controlsMap.Fly.update(delta);
    if (activeControlKey === 'FirstPerson') controlsMap.FirstPerson.update(delta);

    // Movimiento manual para PointerLock
    if (activeControlKey === 'PointerLock' && controlsMap.PointerLock.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        direction.z = Number(keys.w) - Number(keys.s);
        direction.x = Number(keys.d) - Number(keys.a);
        direction.normalize();
        
        if (keys.w || keys.s) velocity.z -= direction.z * 400.0 * delta;
        if (keys.a || keys.d) velocity.x -= direction.x * 400.0 * delta;
        
        controlsMap.PointerLock.moveRight(-velocity.x * delta);
        controlsMap.PointerLock.moveForward(-velocity.z * delta);
    }

    renderer.render(scene, camera);
}

// Redimensionamiento
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Estado inicial
setControl('Orbit');
animate();
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';

/* CONTROLS */
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

/* *********** SCENE, CAMERA, RENDERER *********** */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0x111111, 1, 5);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

/*
    ALTURA DEL JUGADOR / CÁMARA

    Si todavía apareces volando, baja este número:
    -1.9, -2.0, -2.1

    Si quedas muy abajo, súbelo:
    -1.5, -1.3, -1.0
*/
const PLAYER_HEIGHT = -1.8;

// Posición inicial de la cámara/personaje
camera.position.set(0, PLAYER_HEIGHT, 5);

/*
    CUADRO ROJO

    No se borra. Se mantiene como cubo.
    Ahora está ubicado delante del rey.
*/
const boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xff0055 })
);

/*
    Posición del cubo rojo.

    x = izquierda / derecha
    y = altura
    z = adelante / atrás

    Cambié Z de 3.5 a 2.6 para moverlo delante del rey.
*/
boxMesh.position.set(0, -1.75, 2.6);
scene.add(boxMesh);

/* *********** STATS *********** */
const timer = new THREE.Timer();
timer.connect(document);

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

/* *********** DESCRIPTIONS *********** */
const description = {
    Orbit: 'Permite rotar alrededor de un punto objetivo, hacer zoom y desplazarse. Es ideal para visualizar modelos 3D.',
    Fly: 'Permite volar a través de la escena con movimientos suaves. Es ideal para simulaciones de vuelo o exploración en primera persona.',
    FirstPerson: 'Simula el movimiento de un personaje en primera persona, permitiendo caminar y mirar alrededor. Es perfecto para juegos o experiencias inmersivas.',
    PointerLock: 'Similar a FirstPersonControls pero requiere que el usuario haga clic para bloquear el cursor, proporcionando una experiencia de control total. Es ideal para juegos en primera persona.',
    Trackball: 'Similar a OrbitControls pero con una sensación de control más fluida, como si estuvieras manipulando una bola de control. Es excelente para exploración libre.',
    Transform: 'Permite manipular objetos en la escena (mover, rotar, escalar) de manera interactiva. Es útil para editores de escenas o herramientas de diseño.'
};

/* *********** CONTROLS *********** */
const controlMap = {
    Orbit: new OrbitControls(camera, renderer.domElement),
    Fly: new FlyControls(camera, renderer.domElement),
    FirstPerson: new FirstPersonControls(camera, renderer.domElement),
    PointerLock: new PointerLockControls(camera, document.body),
    Trackball: new TrackballControls(camera, renderer.domElement),
    Transform: new TransformControls(camera, renderer.domElement)
};

// Configuración específica de controles
controlMap.Fly.movementSpeed = 5;
controlMap.Fly.rollSpeed = Math.PI / 24;

controlMap.FirstPerson.movementSpeed = 5;
controlMap.FirstPerson.lookSpeed = 0.1;

controlMap.Transform.attach(boxMesh);

/* *********** GESTION DE INTERFAZ Y CAMBIO DE CONTROLS *********** */
let activeControl = 'Orbit';

const titleElement = document.getElementById('control-title');
const descElement = document.getElementById('control-desc');
const instruccionDIV = document.getElementById('instructions');

function setControls(key) {
    // Apagar todos los controles
    Object.keys(controlMap).forEach(controlKey => {
        const control = controlMap[controlKey];

        if (control.enabled !== undefined) {
            control.enabled = false;
        }

        if (controlKey === 'Transform') {
            scene.remove(control.getHelper());
        }
    });

    activeControl = key;
    const active = controlMap[key];

    // Cambiar texto del panel
    titleElement.textContent = `${key} Controls`;
    descElement.textContent = description[key] || 'Descripción no disponible.';

    if (instruccionDIV) {
        instruccionDIV.style.display = key === 'PointerLock' ? 'block' : 'none';
    }

    // Activar control seleccionado
    if (key === 'Transform') {
        scene.add(active.getHelper());
        active.enabled = true;
        controlMap.Orbit.enabled = false;
    } else if (key === 'PointerLock') {
        // No se activa automáticamente. Se activa con clic.
    } else {
        if (active.enabled !== undefined) {
            active.enabled = true;
        }
    }

    // Cada vez que cambies de control, corregimos la altura
    camera.position.y = PLAYER_HEIGHT;
}

/*
    Activar PointerLock al hacer clic.
    Esto va fuera de setControls para no crear muchos eventos repetidos.
*/
renderer.domElement.addEventListener('click', () => {
    if (activeControl === 'PointerLock') {
        controlMap.PointerLock.lock();
    }
});

/* *********** MOVIMIENTO POINTER LOCK *********** */
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();

    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
});

window.addEventListener('keyup', e => {
    const key = e.key.toLowerCase();

    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
});

/* *********** LOAD 3D MODEL *********** */
const loader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('../src/models/glb/');
loader.setDRACOLoader(dracoLoader);

const gltf = await loader.loadAsync('../src/models/glb/castillo.glb');

/*
    MODELO 3D

    Tu castillo está bajado en Y = -2.5.
    Por eso también bajamos la cámara/personaje y el cubo rojo.
*/
gltf.scene.position.set(0, -2.5, 3.5);
gltf.scene.rotation.y = Math.PI * 1.5;
scene.add(gltf.scene);

/* *********** AUDIO *********** */
window.addEventListener('load', function () {
    const audio = document.getElementById('miAudio2');

    const reproducir = function () {
        audio.play()
            .then(function () {
                document.removeEventListener('click', reproducir);
                document.removeEventListener('keydown', reproducir);
            })
            .catch(function () {
                console.log('Esperando interacción real...');
            });
    };

    document.addEventListener('click', reproducir);
    document.addEventListener('keydown', reproducir);
});

/* *********** GUI *********** */
const gui = new GUI();

const params = {
    lightType: 'Hemisphere',
    enabled: true,
    intensity: 1,
    color: '#ffffff',
    positionX: 0
};

/* *********** LIGHT *********** */
let currentLight = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
scene.add(currentLight);

const lightFolder = gui.addFolder('Light');
lightFolder.close();

lightFolder
    .add(params, 'lightType', ['Hemisphere', 'Directional', 'Ambient'])
    .name('Light Type')
    .onChange(changeTypeLight);

lightFolder
    .add(params, 'enabled')
    .name('Light Enabled')
    .onChange(value => currentLight.visible = value);

lightFolder
    .add(params, 'intensity', 0, 2)
    .name('Light Intensity')
    .onChange(value => currentLight.intensity = value);

lightFolder
    .addColor(params, 'color')
    .name('Light Color')
    .onChange(value => currentLight.color.set(value));

lightFolder
    .add(params, 'positionX', -10, 10)
    .name('Position X')
    .onChange(value => currentLight.position.x = value);

function changeTypeLight(typeLight) {
    scene.remove(currentLight);

    switch (typeLight) {
        case 'Hemisphere':
            currentLight = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
            break;

        case 'Directional':
            currentLight = new THREE.DirectionalLight(0xffffff, 1);
            currentLight.position.set(5, 10, 7.5);
            break;

        case 'Ambient':
            currentLight = new THREE.AmbientLight(0xffffff, 0.5);
            break;

        default:
            currentLight = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
            break;
    }

    currentLight.position.set(2, 1, 1);
    scene.add(currentLight);
}

/* *********** CAMERA GUI *********** */
const cameraFolder = gui.addFolder('Camera Translation');
cameraFolder.add(camera.position, 'x', -10, 10).name('Position X');
cameraFolder.add(camera.position, 'y', -10, 10).name('Position Y');
cameraFolder.add(camera.position, 'z', -10, 10).name('Position Z');
cameraFolder.close();

const cameraFolder2 = gui.addFolder('Camera Rotation');
cameraFolder2.add(camera.rotation, 'x', -Math.PI, Math.PI).name('Rotation X');
cameraFolder2.add(camera.rotation, 'y', -Math.PI, Math.PI).name('Rotation Y');
cameraFolder2.add(camera.rotation, 'z', -Math.PI, Math.PI).name('Rotation Z');
cameraFolder2.close();

const cameraFolder3 = gui.addFolder('Camera Controls');
cameraFolder3
    .add(
        { Script: 'Orbit' },
        'Script',
        ['Orbit', 'Trackball', 'Fly', 'FirstPerson', 'PointerLock', 'Transform']
    )
    .onChange(setControls);

cameraFolder3.open();

/* *********** ANIMATE *********** */
function animate() {
    timer.update();
    stats.update();

    const delta = timer.getDelta();

    if (activeControl === 'Orbit') {
        controlMap.Orbit.update();
    }

    if (activeControl === 'Trackball') {
        controlMap.Trackball.update();
    }

    if (activeControl === 'Fly') {
        controlMap.Fly.update(delta);

        // Evita que FlyControls te deje volando hacia arriba o abajo
        camera.position.y = PLAYER_HEIGHT;
    }

    if (activeControl === 'FirstPerson') {
        controlMap.FirstPerson.update(delta);

        // Mantiene el personaje/cámara sobre el modelo
        camera.position.y = PLAYER_HEIGHT;
    }

    if (activeControl === 'PointerLock' && controlMap.PointerLock.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(keys.w) - Number(keys.s);
        direction.x = Number(keys.d) - Number(keys.a);
        direction.normalize();

        if (keys.w || keys.s) {
            velocity.z -= direction.z * 400.0 * delta;
        }

        if (keys.a || keys.d) {
            velocity.x -= direction.x * 400.0 * delta;
        }

        controlMap.PointerLock.moveRight(-velocity.x * delta);
        controlMap.PointerLock.moveForward(-velocity.z * delta);

        // Mantiene el personaje/cámara sobre el modelo
        controlMap.PointerLock.getObject().position.y = PLAYER_HEIGHT;
    }

    renderer.render(scene, camera);
}

/* *********** RESIZE *********** */
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

/* *********** ESTADO INICIAL *********** */
setControls('Orbit');
animate();
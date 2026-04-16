import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { Capsule } from 'three/addons/math/Capsule.js';


const timer = new THREE.Timer();
timer.connect( document );

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); //0x5C0D00

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );


// Light

const fillLight1 = new THREE.HemisphereLight( 0x8dc1de, 0x00668d, 1.5 );
fillLight1.position.set( 2, 1, 1 );
scene.add( fillLight1 );

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );  

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 5, 10, 7.5 );
scene.add( directionalLight );

camera.position.z = 5;

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

function animate( time ) {
    timer.update();
    stats.update();
  renderer.render( scene, camera );
}

/// LOAD SCENE ////////////////////////////////
const loader = new GLTFLoader();
// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '../src/models/glb/' );
loader.setDRACOLoader( dracoLoader );
const gltf = await loader.loadAsync( '../src/models/glb/castillo.glb');
gltf.scene.position.set(0, -2.5, 3.5);
gltf.scene.rotation.y = Math.PI*1.5; // Rota 180 grados en el eje Y
scene.add( gltf.scene );
///////////////////////////////////////////////


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

// ***************************************************************
// AUDIO play
window.addEventListener('load', function() {
    var audio = document.getElementById('miAudio2');
    var reproducir = function() {
        audio.play().then(function() {
            document.removeEventListener('click', reproducir);
            document.removeEventListener('keydown', reproducir);
        }).catch(function(error) {
            console.log("Esperando interacción real...");
        });
    };

    // Escuchar clics o teclas (las interacciones que sí valen)
    document.addEventListener('click', reproducir);
    document.addEventListener('keydown', reproducir);
});

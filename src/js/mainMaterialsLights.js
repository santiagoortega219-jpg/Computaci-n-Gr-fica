import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f9fa);

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Light
const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );  

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 5, 10, 7.5 );
scene.add( directionalLight );

// First Geometry Shape
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ffff,
                                                transparent: true,
                                                opacity: 0.5,
                                                wireframe: false,
                                                wireframeLinewidth: 6             
 } );

const materialStand = new THREE.MeshStandardMaterial( { color: 0xff00ff,
                                                roughness: 0.5,
                                                metalness: 1.0,
                                                transparent: false,
} );

const materialPhong = new THREE.MeshPhongMaterial( { color: 0xffffff,
  specular: 0xffffff,
  shininess: 30,
  side: THREE.DoubleSide,
  map: new THREE.TextureLoader().load( '../../portfolio/clase6/img/uv_test_bw_1024.png' ) //https://threejs.org/examples/textures/uv_grid_opengl.jpg
} );

const materialCube = [new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader().load( '../../portfolio/clase 6/img/face1.jpg'), side: THREE.DoubleSide},
                        new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader().load( '../../portfolio/clase 6/img/face2.png'), side: THREE.DoubleSide},
                        new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader().load( '../../portfolio/clase 6/img/face3.jpg'), side: THREE.DoubleSide},
                        new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader().load( '../../portfolio/clase 6/img/face4.jpg'), side: THREE.DoubleSide},
                        new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader().load( '../../portfolio/clase 6/img/face5.png'), side: THREE.DoubleSide},
                        new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader().load( '../../portfolio/clase 6/img/face6.jpg'), side: THREE.DoubleSide}
) ) ) ) ) )
];

const materialLambert = new THREE.MeshLambertMaterial( { color: 0xffffff,
                                                          side: THREE.DoubleSide,
                                                          map: new THREE.TextureLoader().load( '../../portfolio/clase6/img/face1.jpg' ) //https://threejs.org/examples/textures/uv_grid_opengl.jpg
} );


const cube1 = new THREE.Mesh( geometry, material );
cube1.position.x = -1.5;
const cube2 = new THREE.Mesh( geometry, materialStand );
const cube3 = new THREE.Mesh( geometry, materialPhong );
const cube4 = new THREE.Mesh( geometry, materialCube );
cube3.position.x = 1.5;
cube4.position.x = 3.0;

scene.add( cube1 );
scene.add( cube2 );
scene.add( cube3 );
scene.add( cube4 );

const controls = new OrbitControls( camera, renderer.domElement );
camera.position.z = 5;
controls.update();

function animate( time ) {
  controls.update();
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

///////////////////////////////////////////////
const size = 20;
const divisions = 20;
const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );
///////////////////////////////////////////////


window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
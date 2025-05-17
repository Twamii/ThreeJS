import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// const loader = new GLTFLoader();

// loader.load( './models/Tree.', function ( gltf ) {

//   scene.add( gltf.scene );

// }, undefined, function ( error ) {

//   console.error( error );

// } );
// // On crée une instance de la scène
// const scene = new THREE.Scene();

// // PerspectiveCamera : 75 = 1er paramètre = champ de vision de la scène (valeur en degrés)
// // PerspectiveCamera : window.innerWidth / window.innerHeight = 2er paramètre = aspect ratio (on veut toujours diviser la largeur par la hauteur)
// // PerspectiveCamera : 0.1, 1000 = 3e paramètre = near and far clipping plane ( les objets en dehors de ces valeurs ne seront pas affichés )
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// // On crée une instance du renderer
// const renderer = new THREE.WebGLRenderer();

// // On va définir les dimensions dans laquelle on veut ''renderer'' notre application, ici on utilise les dimensions d'une page web
// renderer.setSize( window.innerWidth, window.innerHeight );

// // On ajoute l'élement ''renderer'' à notre document HTML, ici c'est un <canvas> qui sera utilisé pour afficher la scène
// document.body.appendChild( renderer.domElement );

// // BoxGeometry = objet qui contient tous les sommets et faces d'un cube
// const geometry = new THREE.BoxGeometry( 1, 1, 1 );

// // On a besoin d'un matériel à colorer, pour ça on va utiliser MeshBasicMaterial mais il en existe plusieurs autres
// const material = new THREE.MeshBasicMaterial( { color: 0xff00ff } );

// // Mesh = objet qui va prendre une géométrie et lui appliquer un matériel
// const cube = new THREE.Mesh( geometry, material );

// // Par défaut quand on appelle la scène, l'objet qu'on a ajouté sera placé aux coordonnées (0, 0, 0), ça fera que la caméra et l'objet seront l'un dans l'autre
// scene.add( cube );

// // Pour éviter ça on déplace simplement la caméra
// camera.position.z = 5;


// // Fonction animate = C'est une ''animation loop'' qui va nous permettre d'afficher notre scène chaque fois que l'écran se rafraîchit (60 fps, 144fps etc etc)
// function animate() {

//   // chaque fois que la fonction est appelée (avec les fps) ça va incrémenter la position du cube pour faire en sorte de lui donner une animation de rotation
//   // chaque objet que l'on veut ''changer'', ''déplacer'' etc doit être placé à l'intérieur de cette fonction, on peut toutefois appeler d'autres fonctions à l'intérieur pour éviter d'avoir trop de lignes de codes
//   cube.rotation.x += 0.01;
//   cube.rotation.y += 0.01;

//   renderer.render( scene, camera );
// }
// renderer.setAnimationLoop( animate );


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// c'est ce qui me permet de contrôler la caméra avec ma souris
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const keysPressed = { z: false, q: false, s: false, d: false, space: false, x: false };

// window.addEventListener('keydown', (e) => { keysPressed[e.key.toLowerCase()] = true; });
// window.addEventListener('keyup', (e) => { keysPressed[e.key.toLowerCase()] = false; });

// fonction réadapter pour fonctionner avec la touche espace
window.addEventListener('keydown', (e) => {
  const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
  keysPressed[key] = true;
});

window.addEventListener('keyup', (e) => {
  const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
  keysPressed[key] = false;
});

// Mes variables globales
let model, mixer;
let actions = {};
let currentAction = null;
let background;

const clock = new THREE.Clock();

// Je vais charger mon fichier glb qui contiendra toutes mes animations ( que j'aurais au préalable fusionner dans Blender )
const loader = new GLTFLoader();
loader.load('./models/Animations3.glb', (gltf) => {
  model = gltf.scene;
  model.scale.set(0.08, 0.08, 0.08);
  model.position.set(0, -0.065, 0.5);

  // Permet de faire en sorte que mon model puisse recevoir des ombres mais ça rend moche, je verrai plus tard
  // model.traverse((child) => {
  //   if (child.isMesh) {
  //     child.castShadow = true;
  //     child.receiveShadow = true;
  //   }
  // });

  // j'ajoute mon model dans la scène (ce sera mon fichier glb avec les animations)
  scene.add(model);

  // Me permet de '' centrer '' la caméra sur mon modèle
  const box = new THREE.Box3().setFromObject(model);

  // Ici je récupère le centre et la taille de mon modèle
  // const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // et ici je recentre la caméra sur mon modèle
  // model.position.sub(center);

  // pour positionner la caméra
  camera.position.set(0, size.y * 0.3, size.z * 25);  // Y plus haut, Z en retrait
  // controls.target.set(0, size.y * 0.1, 0); 
  controls.update();


  // c'est grâce au mixer que je vais pouvoir jouer mes animations
  mixer = new THREE.AnimationMixer(model);
  gltf.animations.forEach((clip) => {
    actions[clip.name] = mixer.clipAction(clip);
  });

  // me permet de lancer l'animation StandingIdle au tout début
  if (actions['StandingIdle']) {
    actions['StandingIdle'].play();
    currentAction = actions['StandingIdle'];
  }
}, undefined, (error) => {
  console.error(error);
});

// j'importe mon modèle de maison
const backgroundLoader = new GLTFLoader();
backgroundLoader.load('./models/house.glb', (gltf) => {
  background = gltf.scene;
  background.scale.set(8, 8, 8);
  background.position.set(0, -0.13, 0);
  background.rotation.y = Math.PI/2;
  scene.add(background);

});

// Pour gérer les lumières
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(0, 0, 5).normalize;
// light.castShadow = true;
scene.add(light);

// const backLight = new THREE.DirectionalLight(0xffffff, 1);
// backLight.position.set(0, 0, -5);
// scene.add(backLight);


// Fonction pour changer parmi les différentes animations de mon fichier glb selon la touche maintenue
function switchAnimation(newName) {
  if (!actions[newName] || currentAction === actions[newName]) return;
  currentAction.fadeOut(0.5);
  actions[newName].reset().fadeIn(0.5).play();
  currentAction = actions[newName];
}

// C'est une ''animation loop'' qui va nous permettre d'afficher notre scène chaque fois que l'écran se rafraîchit (60 fps, 144fps etc etc)
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  // Touches pour lancers les animations
  const isMoving = keysPressed['z'] || keysPressed['s'] || keysPressed['q'] || keysPressed['d'];
  const isJumping = keysPressed['space'];
  const isDancing = keysPressed['x'];

  if (model) {
    const speed = 0.01;

    // Déplacement
    if (keysPressed['z']) model.position.z -= speed;
    if (keysPressed['s']) model.position.z += speed;
    if (keysPressed['q']) model.position.x -= speed;
    if (keysPressed['d']) model.position.x += speed;

    // Direction dans laquelle mon perso regarde quand j'appuie sur une touche de déplacement
    let direction = new THREE.Vector3();

    if (keysPressed['z']) direction.z -= 1;
    if (keysPressed['s']) direction.z += 1;
    if (keysPressed['q']) direction.x -= 1;
    if (keysPressed['d']) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();

      const angle = Math.atan2(direction.x, direction.z);
      model.rotation.y = angle;
    }
    
  }

  // pour changer d'animation
  if (isMoving) {
    switchAnimation('Walking');
  } else if (isJumping) {
    switchAnimation('Jump');
  } else if (isDancing) {
    switchAnimation('Dancing')
  } else {
    switchAnimation('StandingIdle');
  }

  renderer.render(scene, camera);
}
animate();
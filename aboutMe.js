// about.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 1.6, 5); // Adjust as needed

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Append renderer to container
const container = document.getElementById('threejs-container');
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Load 3D Model
const loader = new GLTFLoader();
loader.load(
    'assets/models/your-model.glb', // Replace with your model's path
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
    },
    undefined,
    (error) => {
        console.error('Error loading model:', error);
    }
);

// Handle Window Resize
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Hamburger Menu Script
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
let menuOpen = false;
hamburger.addEventListener('click', () => {
    navMenu.style.right = menuOpen ? '-250px' : '0';
    menuOpen = !menuOpen;
});

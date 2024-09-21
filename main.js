import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import gsap from 'gsap';

// Scene and Camera
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 0, 20);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Label Renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// Projects Array
const projects = [
  { title: 'Project 1', color: 0xff5000, link: '#' },
  { title: 'Project 2', color: 0x00af00, link: '#' },
  { title: 'Project 3', color: 0x0100af, link: '#' },
  { title: 'Project 4', color: 0xffff00, link: '#' },
  { title: 'Project 5', color: 0xff00ff, link: '#' },
  { title: 'Project 6', color: 0x00ffff, link: '#' },
  { title: 'Project 7', color: 0xffffff, link: '#' },
  { title: 'Project 8', color: 0x888888, link: '#' },
  { title: 'Project 9', color: 0x003854, link: '#' }
];

let projectMeshes = [];

function loadProjects() {
  projects.forEach((project, index) => {
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const material = new THREE.MeshStandardMaterial({ color: project.color });
    const cube = new THREE.Mesh(geometry, material);

    // Store initial position
    cube.userData.initialPosition = cube.position.clone();
    cube.userData.link = project.link;

    // Label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = project.title;

    const label = new CSS2DObject(labelDiv);
    label.position.set(0, -2.2, 0);
    cube.add(label);

    scene.add(cube);
    projectMeshes.push(cube);
  });
}

function layoutProjects() {
  let screenWidth = window.innerWidth;

  // Determine columns
  let cols = 3;
  if (screenWidth < 600) {
    cols = 1;
  } else if (screenWidth < 900) {
    cols = 2;
  }

  let spacing = 5;

  projectMeshes.forEach((cube, index) => {
    const x = (index % cols) * spacing - ((cols - 1) * spacing) / 2;
    const y = -Math.floor(index / cols) * spacing + 5;

    cube.position.x = x;
    cube.position.y = y;
    cube.userData.initialPosition.x = x;
    cube.userData.initialPosition.y = y;
  });
}

loadProjects();
layoutProjects();

// Interactivity
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function onPointerDown(event) {
  event.preventDefault();

  let clientX, clientY;
  if (event.touches) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(projectMeshes);

  if (intersects.length > 0) {
    const selectedObject = intersects[0].object;
    const projectLink = selectedObject.userData.link;

    // Open project link
    window.open(projectLink, '_blank');
  }
}

function animateBlock(block, hover) {
  if (hover) {
    // Rotate the block to 180 degrees on Y-axis
    gsap.to(block.rotation, { y: Math.PI, duration: 0.6, ease: "power2.out" });
  } else {
    // Reset the rotation
    gsap.to(block.rotation, { y: 0, duration: 0.6, ease: "power2.out" });
  }
}

function onPointerMove(event) {
  event.preventDefault();

  let clientX, clientY;
  if (event.touches) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(projectMeshes);

  if (intersects.length > 0) {
    if (hoveredObject !== intersects[0].object) {
      if (hoveredObject) {
        // Reset previous hovered object
        animateBlock(hoveredObject, false);
      }
      hoveredObject = intersects[0].object;
      animateBlock(hoveredObject, true);
    }
  } else {
    if (hoveredObject) {
      // Reset previous hovered object
      animateBlock(hoveredObject, false);
      hoveredObject = null;
    }
  }
}

window.addEventListener('pointerdown', onPointerDown, false);
window.addEventListener('pointermove', onPointerMove, false);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);

  layoutProjects();
});

// Animation Loop
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  let elapsedTime = clock.getElapsedTime();

  projectMeshes.forEach((cube, index) => {
    let hoverHeight = 0.2;
    let speed = 0.5;
    let baseY = cube.userData.initialPosition.y + Math.sin(elapsedTime * speed + index) * hoverHeight;
    cube.position.y = baseY;
  });

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

animate();
// Hamburger Menu Interactivity
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  if (!menuOpen) {
    navMenu.style.right = '0';
    menuOpen = true;
  } else {
    navMenu.style.right = '-250px';
    menuOpen = false;
  }
});

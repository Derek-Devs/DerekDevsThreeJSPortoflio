import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

// GLTFLoader
const loader = new GLTFLoader();

// Projects Array
const projects = [
  { title: 'Machine Learning Projects', iconPath: '/icons/machine_learning.glb', link: 'machinelearning' },
  { title: 'Project 2', iconPath: '/icons/economymachinelearning.glb', link: '#' },
  { title: 'Project 3', iconPath: '/icons/hourglass.glb', link: '#' },
  { title: 'Data Visualization', iconPath: '/icons/tableu.glb', link: '#' },
  { title: 'Project 5', iconPath: '/icons/hourglass.glb', link: '#' },
  { title: 'Project 6', iconPath: '/icons/aboutme.glb', link: '#' },
  { title: 'Project 7', iconPath: '/icons/gamedev.glb', link: '#' },
  { title: 'About', iconPath: '/icons/gamedev.glb', link: '#' },
  { title: 'Indie Game Development', iconPath: '/icons/gamedev.glb', link: '#' }
];

let projectMeshes = [];

function loadProjects() {
  let modelsLoaded = 0;

  projects.forEach((project, index) => {
    if (project.iconPath) {
      // Load the icon
      loader.load(
        project.iconPath,
        (gltf) => {
          const icon = gltf.scene;

          // Compute the bounding box of the model
          const box = new THREE.Box3().setFromObject(icon);
          const size = new THREE.Vector3();
          box.getSize(size);

          // Desired size for the icons
          const desiredSize = 3; // Adjust this value as needed

          // Calculate the maximum dimension among x, y, and z
          const maxDimension = Math.max(size.x, size.y, size.z);

          // Calculate the scaling factor
          const scaleFactor = desiredSize / maxDimension;

          // Apply the scaling uniformly
          icon.scale.multiplyScalar(scaleFactor);

          // Center the icon
          box.setFromObject(icon);
          const center = box.getCenter(new THREE.Vector3());
          icon.position.sub(center); // Center the icon at the origin

          // Create a group to hold the icon and label
          const projectGroup = new THREE.Object3D();
          projectGroup.add(icon);

          // Add label
          const labelDiv = document.createElement('div');
          labelDiv.className = 'label';
          labelDiv.textContent = project.title;

          const label = new CSS2DObject(labelDiv);
          label.position.set(0, -desiredSize / 2 - 0.5, 0);
          projectGroup.add(label);

          // Store project data
          projectGroup.userData = {
            link: project.link,
            index: index, // Store index for reference
            isRotating: false, // Flag to track rotation on hover
          };

          // Add to scene and projectMeshes array
          scene.add(projectGroup);
          projectMeshes.push(projectGroup);

          // Increment modelsLoaded and check if all models are loaded
          modelsLoaded++;
          if (modelsLoaded === projects.length) {
            layoutProjects();
          }
        },
        undefined,
        (error) => {
          console.error('An error occurred while loading the icon:', error);

          // Increment modelsLoaded and check if all models are loaded
          modelsLoaded++;
          if (modelsLoaded === projects.length) {
            layoutProjects();
          }
        }
      );
    } else {
      console.error(`Project ${project.title} has an invalid iconPath.`);
      modelsLoaded++;
      if (modelsLoaded === projects.length) {
        layoutProjects();
      }
    }
  });
}

function layoutProjects() {
  let screenWidth = window.innerWidth;

  // Determine columns based on screen width
  let cols = 3;
  if (screenWidth < 600) {
    cols = 1;
  } else if (screenWidth < 900) {
    cols = 2;
  }

  let spacing = 6; // Adjust spacing as needed

  projectMeshes.forEach((projectGroup, index) => {
    const x = (index % cols) * spacing - ((cols - 1) * spacing) / 2;
    const y = -Math.floor(index / cols) * spacing + 5;

    // Set the position
    projectGroup.position.set(x, y, 0);

    // Store initial position for animations
    projectGroup.userData.initialPosition = new THREE.Vector3(x, y, 0);
  });
}

loadProjects();

// Interactivity
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function getPointerCoordinates(event) {
  if (event.touches && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  } else {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
}

function onPointerDown(event) {
  event.preventDefault();

  const { x, y } = getPointerCoordinates(event);

  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = - (y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(projectMeshes, true);

  if (intersects.length > 0) {
    let selectedObject = intersects[0].object;
    // Traverse up to find the projectGroup
    while (selectedObject && !selectedObject.userData.link) {
      selectedObject = selectedObject.parent;
    }
    if (selectedObject) {
      const projectLink = selectedObject.userData.link;
      // Open project link
      window.open(projectLink, '_blank');
    }
  }
}

function animateBlock(block, hover) {
  if (hover) {
    block.userData.isRotating = true;
  } else {
    block.userData.isRotating = false;
    // Reset rotation
    block.rotation.set(0, 0, 0);
  }
}

function onPointerMove(event) {
  event.preventDefault();

  const { x, y } = getPointerCoordinates(event);

  mouse.x = (x / window.innerWidth) * 2 - 1;
  mouse.y = - (y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(projectMeshes, true);

  if (intersects.length > 0) {
    let selectedObject = intersects[0].object;
    // Traverse up to find the projectGroup
    while (selectedObject && !selectedObject.userData.link) {
      selectedObject = selectedObject.parent;
    }
    if (selectedObject) {
      if (hoveredObject !== selectedObject) {
        if (hoveredObject) {
          // Reset previous hovered object
          animateBlock(hoveredObject, false);
        }
        hoveredObject = selectedObject;
        animateBlock(hoveredObject, true);
      }
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

// Prevent default touch actions on the canvas
renderer.domElement.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
renderer.domElement.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);

  layoutProjects();
}

window.addEventListener('resize', onWindowResize, false);

// Animation Loop
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  let elapsedTime = clock.getElapsedTime();

  projectMeshes.forEach((projectGroup, index) => {
    let hoverHeight = 0.2;
    let speed = 0.5;
    let baseY = projectGroup.userData.initialPosition.y + Math.sin(elapsedTime * speed + index) * hoverHeight;
    projectGroup.position.y = baseY;

    if (projectGroup.userData.isRotating) {
      // Rotate the projectGroup
      projectGroup.rotation.y += 0.05; // Adjust the rotation speed as needed
    }
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

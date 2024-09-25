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
  { title: 'Machine Learning', iconPath: '/icons/machine_learning.glb', link: 'machinelearning' },
  { title: 'Data Visualization', iconPath: '/icons/tableu.glb', link: '#' },
  { title: 'SQL Examples', iconPath: '/icons/sql.glb', link: '#' },
  { title: 'DAX Examples', iconPath: '/icons/dax.glb', link: '#' },
  { title: 'stuff', iconPath: '/icons/hourglass.glb', link: '#' },
  { title: 'Project 6', iconPath: '/icons/aboutme.glb', link: '#' },
  { title: 'Web Development', iconPath: '/icons/webdev.glb', link: '#' },
  { title: 'About Me', iconPath: '/icons/aboutme.glb', link: '#' },
  { title: 'Indie Game Development', iconPath: '/icons/gamedev.glb', link: '#' }
];

let projectMeshes = [];

// **Add the stars**
let starGroup;

function createStars() {
  starGroup = new THREE.Group();
  const starGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const starCount = 500; // Adjust the number of stars as needed

  for (let i = 0; i < starCount; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);

    // Random position within a certain range
    star.position.x = THREE.MathUtils.randFloatSpread(200); // Random between -100 and 100
    star.position.y = THREE.MathUtils.randFloatSpread(200);
    star.position.z = THREE.MathUtils.randFloatSpread(200) - 100; // Place them behind the projects

    // Initially position stars off-screen for the slide-in effect
    star.position.y += 100; // Adjust as needed

    starGroup.add(star);
  }

  scene.add(starGroup);

  // Animate stars sliding into view
  starGroup.children.forEach((star) => {
    gsap.to(star.position, {
      y: star.position.y - 100, // Move back to original position
      duration: 2,
      ease: 'power2.out',
      delay: Math.random() * 2 // Random delay for each star
    });
  });
}

let mouse = new THREE.Vector2();
let target = new THREE.Vector2();
let windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

function onMouseMove(event) {
  mouse.x = (event.clientX - windowHalf.x) / windowHalf.x;
  mouse.y = (event.clientY - windowHalf.y) / windowHalf.y;
}

window.addEventListener('mousemove', onMouseMove, false);

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

          // Recompute bounding box after centering
          box.setFromObject(icon);

          // Get minY of the icon
          const minY = box.min.y;

          // Create a group to hold the icon and label
          const projectGroup = new THREE.Object3D();
          projectGroup.add(icon);

          // Add label
          const labelDiv = document.createElement('div');
          labelDiv.className = 'label';
          labelDiv.textContent = project.title;

          const label = new CSS2DObject(labelDiv);
          label.position.set(0, minY - 2, 0); // Adjust the offset as needed
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

  const totalProjects = projectMeshes.length;
  const rows = Math.ceil(totalProjects / cols);
  const totalHeight = (rows - 1) * spacing;

  projectMeshes.forEach((projectGroup, index) => {
    const x = (index % cols) * spacing - ((cols - 1) * spacing) / 2;
    const y = -Math.floor(index / cols) * spacing + totalHeight / 2;

    // Set the position
    projectGroup.position.set(x, y, 0);

    // Store initial position for animations
    projectGroup.userData.initialPosition = new THREE.Vector3(x, y, 0);
  });
}

createStars();
loadProjects();

// Interactivity
const raycaster = new THREE.Raycaster();
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

  const mousePos = new THREE.Vector2();
  mousePos.x = (x / window.innerWidth) * 2 - 1;
  mousePos.y = - (y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mousePos, camera);
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

  const mousePos = new THREE.Vector2();
  mousePos.x = (x / window.innerWidth) * 2 - 1;
  mousePos.y = - (y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mousePos, camera);
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

  windowHalf.set(window.innerWidth / 2, window.innerHeight / 2);
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

  // Mouse parallax effect for stars
  target.x = (1 - mouse.x) * 0.02;
  target.y = (1 - mouse.y) * 0.02;

  if (starGroup) {
    starGroup.rotation.y += 0.0005; // Optional slow rotation

    gsap.to(starGroup.rotation, {
      x: target.y,
      y: target.x,
      duration: 0.5,
      ease: 'power1.out'
    });
  }

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

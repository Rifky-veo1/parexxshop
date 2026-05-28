/**
 * Gusion 3D Interactive WebGL Backdrop (c:\xampp\htdocs\api 3\three-bg.js)
 * Implements a full-screen interactive 3D cosmic field with flying daggers,
 * mouse-tracking lights, and dynamic color morphing using Three.js.
 */

let scene, camera, renderer;
let particleSystem, particleGeometry, particleMaterial;
let floatingDaggers = [];
let pointLight, mouseLight;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

const PARTICLE_COUNT = 1500;
const DAGGER_COUNT = 8;

// Colors mapping matching the CSS skin variables
const SKIN_COLORS = {
  default: {
    primary: 0x00f3ff,   // Neon Cyan
    accent: 0x8b5cf6,    // Purple
    light: 0x00a2ff      // Soft blue
  },
  cosmic: {
    primary: 0xd946ef,   // Cosmic Magenta
    accent: 0x3b82f6,    // Blue
    light: 0x7c3aed      // Purple
  },
  kof: {
    primary: 0xf97316,   // Volcanic Orange
    accent: 0xef4444,    // Crimson Red
    light: 0xff3700      // Solar Fire
  }
};

let currentSkin = 'kof';

function initThree() {
  const container = document.getElementById('webgl-background');
  if (!container) return;

  // 1. SCENE & CAMERA
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050308, 0.002);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 250;

  // 2. RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // 3. LIGHTS
  const ambientLight = new THREE.AmbientLight(0x0a0614, 1.5);
  scene.add(ambientLight);

  // Main floating energy light
  pointLight = new THREE.PointLight(SKIN_COLORS.kof.primary, 4, 350);
  pointLight.position.set(100, 100, 100);
  scene.add(pointLight);

  // Interactive mouse light
  mouseLight = new THREE.PointLight(SKIN_COLORS.kof.accent, 3, 200);
  mouseLight.position.set(0, 0, 100);
  scene.add(mouseLight);

  // 4. COSMIC STARFIELD PARTICLES
  particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const baseColor = new THREE.Color(SKIN_COLORS.kof.primary);
  const accentColor = new THREE.Color(SKIN_COLORS.kof.accent);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Distribute particles in a large sphere
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 200 + Math.random() * 250;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Mix primary and accent colors
    const mixedColor = baseColor.clone().lerp(accentColor, Math.random());
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;

    sizes[i] = 1.0 + Math.random() * 4.0;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Generate glowing circular particle texture programmatically
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvas);

  particleMaterial = new THREE.PointsMaterial({
    size: 2.8,
    vertexColors: true,
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // 5. FLOATING 3D BLADE GEOMETRIES
  create3DDaggers();

  // 6. EVENT LISTENERS
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);

  // Start Animation
  animate();
}

/**
 * Creates custom flattened diamond geometry that resembles Gusion's energy blades
 */
function create3DDaggers() {
  // Clear any existing daggers
  floatingDaggers.forEach(d => scene.remove(d.mesh));
  floatingDaggers = [];

  const daggerColor = SKIN_COLORS[currentSkin].primary;

  for (let i = 0; i < DAGGER_COUNT; i++) {
    // Build a custom 3D dagger mesh by creating an elongated double pyramid (octahedron)
    const geom = new THREE.ConeGeometry(5, 45, 4, 1);
    geom.scale(1, 1, 0.15); // Flatten it heavily so it looks like a flat blade

    const mat = new THREE.MeshStandardMaterial({
      color: daggerColor,
      emissive: daggerColor,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.8,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geom, mat);

    // Randomize initial positions in space
    const posX = (Math.random() - 0.5) * 350;
    const posY = (Math.random() - 0.5) * 300;
    const posZ = -100 + Math.random() * 200;
    mesh.position.set(posX, posY, posZ);

    // Randomize initial rotations
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    scene.add(mesh);

    floatingDaggers.push({
      mesh: mesh,
      speedX: 0.1 + Math.random() * 0.2,
      speedY: 0.1 + Math.random() * 0.15,
      rotX: 0.005 + Math.random() * 0.01,
      rotY: 0.005 + Math.random() * 0.01,
      rotZ: 0.002 + Math.random() * 0.005,
      bounceSpeed: 0.5 + Math.random() * 1.5,
      bounceOffset: Math.random() * 10,
      initialY: posY
    });
  }
}

function onMouseMove(event) {
  // Normalize mouse coordinates to center (-1 to 1)
  mouseX = (event.clientX - window.innerWidth / 2) / 100;
  mouseY = (event.clientY - window.innerHeight / 2) / 100;
  
  // Calculate relative 3D space vector for cursor light mapping
  const vec = new THREE.Vector3();
  const pos = new THREE.Vector3();
  
  vec.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
    0.5
  );
  
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  const distance = -camera.position.z / vec.z;
  pos.copy(camera.position).add(vec.multiplyScalar(distance));
  
  // Animate the interactive light to glide under cursor
  if (typeof gsap !== 'undefined') {
    gsap.to(mouseLight.position, {
      x: pos.x,
      y: pos.y,
      z: 80,
      duration: 0.8,
      ease: "power2.out"
    });
  } else {
    mouseLight.position.set(pos.x, pos.y, 80);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Handles smooth color blending of lights and stars when skin changes
 */
function updateThreeTheme(skinName) {
  if (!SKIN_COLORS[skinName]) return;
  currentSkin = skinName;

  const targetColors = SKIN_COLORS[skinName];
  const duration = 0.8; // Blend duration in seconds

  if (typeof gsap !== 'undefined') {
    // 1. Blend point light color
    gsap.to(pointLight.color, {
      r: new THREE.Color(targetColors.primary).r,
      g: new THREE.Color(targetColors.primary).g,
      b: new THREE.Color(targetColors.primary).b,
      duration: duration
    });

    // 2. Blend mouse cursor light color
    gsap.to(mouseLight.color, {
      r: new THREE.Color(targetColors.accent).r,
      g: new THREE.Color(targetColors.accent).g,
      b: new THREE.Color(targetColors.accent).b,
      duration: duration
    });

    // 3. Blend particle system buffer colors dynamically
    const colorsAttr = particleGeometry.attributes.color;
    const count = colorsAttr.count;

    const targetColBase = new THREE.Color(targetColors.primary);
    const targetColAccent = new THREE.Color(targetColors.accent);

    // Trigger smooth tween transition on particle buffers
    const colorArray = colorsAttr.array;
    
    // We can interpolate particle colors in place by running an update animation
    const animObj = { progress: 0 };
    const origColors = Array.from(colorArray);

    gsap.to(animObj, {
      progress: 1,
      duration: duration,
      onUpdate: () => {
        for (let i = 0; i < count; i++) {
          const randSeed = (i / count); // Seed for lerp stability
          const finalColor = targetColBase.clone().lerp(targetColAccent, randSeed);
          
          // Grab original color values
          const origR = origColors[i * 3];
          const origG = origColors[i * 3 + 1];
          const origB = origColors[i * 3 + 2];
          
          // Interpolate color values
          colorArray[i * 3] = origR + (finalColor.r - origR) * animObj.progress;
          colorArray[i * 3 + 1] = origG + (finalColor.g - origG) * animObj.progress;
          colorArray[i * 3 + 2] = origB + (finalColor.b - origB) * animObj.progress;
        }
        colorsAttr.needsUpdate = true;
      }
    });

    // 4. Re-tint and update the materials of our 3D daggers
    floatingDaggers.forEach(d => {
      gsap.to(d.mesh.material.color, {
        r: new THREE.Color(targetColors.primary).r,
        g: new THREE.Color(targetColors.primary).g,
        b: new THREE.Color(targetColors.primary).b,
        duration: duration
      });
      gsap.to(d.mesh.material.emissive, {
        r: new THREE.Color(targetColors.primary).r,
        g: new THREE.Color(targetColors.primary).g,
        b: new THREE.Color(targetColors.primary).b,
        duration: duration
      });
    });
  } else {
    // Fallback: update colors immediately without GSAP
    pointLight.color.setHex(targetColors.primary);
    mouseLight.color.setHex(targetColors.accent);
    
    const colorsAttr = particleGeometry.attributes.color;
    const count = colorsAttr.count;
    const colorArray = colorsAttr.array;
    const targetColBase = new THREE.Color(targetColors.primary);
    const targetColAccent = new THREE.Color(targetColors.accent);
    
    for (let i = 0; i < count; i++) {
      const randSeed = (i / count);
      const finalColor = targetColBase.clone().lerp(targetColAccent, randSeed);
      colorArray[i * 3] = finalColor.r;
      colorArray[i * 3 + 1] = finalColor.g;
      colorArray[i * 3 + 2] = finalColor.b;
    }
    colorsAttr.needsUpdate = true;

    floatingDaggers.forEach(d => {
      d.mesh.material.color.setHex(targetColors.primary);
      d.mesh.material.emissive.setHex(targetColors.primary);
    });
  }
}

/**
 * Main WebGL rendering tick loop
 */
function animate() {
  requestAnimationFrame(animate);

  // Smooth mouse inertia tracking
  targetX += (mouseX - targetX) * 0.08;
  targetY += (mouseY - targetY) * 0.08;

  // Skew camera position based on mouse coordinates for 3D depth parallax
  camera.position.x = targetX * 15;
  camera.position.y = -targetY * 15;
  camera.lookAt(scene.position);

  // Rotate starfield slowly
  if (particleSystem) {
    particleSystem.rotation.y += 0.0006;
    particleSystem.rotation.x += 0.0003;
  }

  // Floating point energy light orbits in a wave pattern
  const time = Date.now() * 0.0008;
  pointLight.position.x = Math.sin(time) * 120 + 20;
  pointLight.position.y = Math.cos(time * 0.7) * 100;
  pointLight.position.z = Math.cos(time * 0.3) * 60 + 50;

  // Animate 3D Daggers (Drifting and spinning in space)
  floatingDaggers.forEach((d, idx) => {
    // 1. Move them forward and loop when they go off screen
    d.mesh.position.y -= d.speedY;
    d.mesh.position.x += Math.sin(time + idx) * 0.15;
    
    // Loop daggers back to top when they float too low
    if (d.mesh.position.y < -220) {
      d.mesh.position.y = 220;
      d.mesh.position.x = (Math.random() - 0.5) * 350;
    }

    // 2. Slow orbital rotation
    d.mesh.rotation.x += d.rotX;
    d.mesh.rotation.y += d.rotY;
    d.mesh.rotation.z += d.rotZ;

    // 3. Subtle hover levitation bounce
    const bounceOffset = Math.sin(time * d.bounceSpeed + d.bounceOffset) * 0.3;
    d.mesh.position.y += bounceOffset;
  });

  renderer.render(scene, camera);
}

// Bootstrap Three.js initialization on page load
document.addEventListener('DOMContentLoaded', () => {
  // Ensure THREE.js is loaded first before executing
  if (typeof THREE !== 'undefined') {
    initThree();
  } else {
    console.error("Three.js not found. Interactive background disabled.");
  }
});

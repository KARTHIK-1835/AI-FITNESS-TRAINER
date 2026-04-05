/* ===========================
   3D MANNEQUIN ENGINE (THREE.JS)
   Restored as per user request
   =========================== */

let scene, camera, renderer, mannequin;
let animationId = null;
let currentAnimExercise = 'squats';
let time = 0;

// Mannequin parts for animation
const parts = {
  torso: null,
  head: null,
  lArm: null, lForearm: null,
  rArm: null, rForearm: null,
  lLeg: null, lCalf: null,
  rLeg: null, rCalf: null
};

/* ===========================
   INITIALIZATION
   =========================== */
function init3DAnimation(containerId) {
  if (animationId) cancelAnimationFrame(animationId);
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear previous canvas if any
  container.innerHTML = '';

  // Scene setup
  scene = new THREE.Scene();
  // Transparent background to show the galaxy theme behind it
  scene.background = null;

  // Camera
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 5, 25);
  camera.lookAt(0, 2, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0x7c3aed, 0.8); // Accent rim light
  backLight.position.set(-10, 10, -10);
  scene.add(backLight);

  // Create Mannequin
  createMannequin();
  scene.add(mannequin);

  // Handle Resize
  window.addEventListener('resize', () => {
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Start Loop
  time = 0;
  animate();
}

/* ===========================
   MODEL CONSTRUCTION
   =========================== */
function createMannequin() {
  mannequin = new THREE.Group();

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.4 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.6 }); // Theme purple
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }); // Dark gray

  // Helper function to create limbs with proper pivot points
  function createLimb(radius, length, material, yOffset) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.8, length, 16), material);
    mesh.position.y = -length / 2 + yOffset;
    group.add(mesh);
    return group;
  }

  // Torso (Main Pivot is Hips)
  parts.torso = new THREE.Group();
  const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.0, 4, 16), shirtMat);
  torsoMesh.position.y = 2; // Move up so pivot is at bottom
  parts.torso.add(torsoMesh);
  parts.torso.position.y = 5; // Hip height
  mannequin.add(parts.torso);

  // Head
  parts.head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), skinMat);
  parts.head.position.y = 4.5;
  parts.torso.add(parts.head);

  // Left Arm (Shoulder Pivot)
  parts.lArm = createLimb(0.35, 2.5, skinMat, 0);
  parts.lArm.position.set(1.6, 3.5, 0);
  parts.torso.add(parts.lArm);

  // Left Forearm (Elbow Pivot)
  parts.lForearm = createLimb(0.3, 2.2, skinMat, 0);
  parts.lForearm.position.set(0, -2.5, 0);
  parts.lArm.add(parts.lForearm);

  // Right Arm (Shoulder Pivot)
  parts.rArm = createLimb(0.35, 2.5, skinMat, 0);
  parts.rArm.position.set(-1.6, 3.5, 0);
  parts.torso.add(parts.rArm);

  // Right Forearm (Elbow Pivot)
  parts.rForearm = createLimb(0.3, 2.2, skinMat, 0);
  parts.rForearm.position.set(0, -2.5, 0);
  parts.rArm.add(parts.rForearm);

  // Left Leg (Hip Pivot)
  parts.lLeg = createLimb(0.45, 3, pantsMat, 0);
  parts.lLeg.position.set(0.6, 0, 0);
  parts.torso.add(parts.lLeg);

  // Left Calf (Knee Pivot)
  parts.lCalf = createLimb(0.35, 3, skinMat, 0);
  parts.lCalf.position.set(0, -3, 0);
  parts.lLeg.add(parts.lCalf);

  // Right Leg (Hip Pivot)
  parts.rLeg = createLimb(0.45, 3, pantsMat, 0);
  parts.rLeg.position.set(-0.6, 0, 0);
  parts.torso.add(parts.rLeg);

  // Right Calf (Knee Pivot)
  parts.rCalf = createLimb(0.35, 3, skinMat, 0);
  parts.rCalf.position.set(0, -3, 0);
  parts.rLeg.add(parts.rCalf);
}

/* ===========================
   ANIMATION LOOP & POSES
   =========================== */
function animate() {
  time += 0.05;
  const t = (Math.sin(time) + 1) / 2; // 0 to 1 oscillating

  applyPose(currentAnimExercise, t);

  renderer.render(scene, camera);
  animationId = requestAnimationFrame(animate);
}

function applyPose(type, t) {
  // Reset all rotations first
  const allParts = [parts.torso, parts.lArm, parts.rArm, parts.lForearm, parts.rForearm, parts.lLeg, parts.rLeg, parts.lCalf, parts.rCalf];
  allParts.forEach(p => { p.rotation.set(0, 0, 0); });
  parts.torso.position.y = 5;

  const normType = type.toLowerCase().replace(/-/g, '').replace(/_/g, '');

  switch (normType) {
    case 'squat':
    case 'squats':
      // Arms up for balance
      parts.lArm.rotation.x = -Math.PI / 2;
      parts.rArm.rotation.x = -Math.PI / 2;

      // Hips go down
      parts.torso.position.y = 5 - (t * 2.5);

      // Torso leans slightly forward to balance
      parts.torso.rotation.x = t * 0.4;

      // Thighs come up (relative to torso)
      parts.lLeg.rotation.x = -t * 1.5;
      parts.rLeg.rotation.x = -t * 1.5;

      // Calves stay vertical (bend knees)
      parts.lCalf.rotation.x = t * 1.5;
      parts.rCalf.rotation.x = t * 1.5;
      break;

    case 'bicepcurls':
      // Arms at sides, elbows bend
      parts.lForearm.rotation.x = -t * 2.0;
      parts.rForearm.rotation.x = -t * 2.0;
      break;

    case 'jumpingjacks':
      // Legs spread out sideways
      parts.lLeg.rotation.z = -t * 0.5;
      parts.rLeg.rotation.z = t * 0.5;

      // Arms go up sideways
      parts.lArm.rotation.z = -t * Math.PI * 0.8;
      parts.rArm.rotation.z = t * Math.PI * 0.8;

      // Slight vertical bounce
      parts.torso.position.y = 5 + (Math.sin(t * Math.PI) * 1.0);
      break;

    case 'pushups':
      // Rotate whole body to plank position
      mannequin.rotation.x = Math.PI / 2 + 0.2;
      mannequin.position.y = -2;

      // Body goes down
      parts.torso.position.z = -t * 1.5;

      // Arms bend outward
      parts.lArm.rotation.z = -Math.PI / 4;
      parts.rArm.rotation.z = Math.PI / 4;
      parts.lArm.rotation.x = -t * 1.0;
      parts.rArm.rotation.x = -t * 1.0;

      parts.lForearm.rotation.x = t * 1.0;
      parts.rForearm.rotation.x = t * 1.0;
      break;

    case 'lunges':
      // Torso goes down directly
      parts.torso.position.y = 5 - (t * 2.0);

      // Front leg (Left) steps forward and bends
      parts.lLeg.rotation.x = -t * Math.PI / 2;
      parts.lCalf.rotation.x = t * Math.PI / 2;

      // Back leg (Right) stays back and bends down
      parts.rLeg.rotation.x = t * 0.2;
      parts.rCalf.rotation.x = t * Math.PI / 2.5;
      break;

    case 'shoulderpress':
      // Upper arms parallel to ground at bottom
      parts.lArm.rotation.z = -Math.PI / 2 + (t * Math.PI / 2);
      parts.rArm.rotation.z = Math.PI / 2 - (t * Math.PI / 2);

      // Forearms point straight up
      parts.lForearm.rotation.z = Math.PI / 2 - (t * Math.PI / 2);
      parts.rForearm.rotation.z = -Math.PI / 2 + (t * Math.PI / 2);

      // Slightly forward to avoid clipping head
      parts.lArm.rotation.x = -0.1;
      parts.rArm.rotation.x = -0.1;
      break;

    case 'highknees':
      // Alternating high knees
      const legT = Math.sin(t * Math.PI * 2);
      parts.torso.position.y = 5 + Math.abs(legT) * 0.5;

      parts.lLeg.rotation.x = Math.min(0, legT) * 1.5;
      parts.lCalf.rotation.x = Math.max(0, -legT) * 1.5;
      parts.rLeg.rotation.x = Math.min(0, -legT) * 1.5;
      parts.rCalf.rotation.x = Math.max(0, legT) * 1.5;

      parts.lArm.rotation.x = legT * 0.8;
      parts.rArm.rotation.x = -legT * 0.8;
      parts.lForearm.rotation.x = 1.0;
      parts.rForearm.rotation.x = 1.0;
      break;

    case 'calfraises':
      parts.torso.position.y = 5 + (t * 0.8);
      parts.lCalf.rotation.x = -t * 0.2;
      parts.rCalf.rotation.x = -t * 0.2;
      break;

    case 'glutebridges':
      mannequin.position.y = -3;
      mannequin.rotation.x = -Math.PI / 2;

      parts.lLeg.rotation.x = -Math.PI / 2 + (t * 0.5);
      parts.rLeg.rotation.x = -Math.PI / 2 + (t * 0.5);
      parts.lCalf.rotation.x = Math.PI / 2 - (t * 0.5);
      parts.rCalf.rotation.x = Math.PI / 2 - (t * 0.5);
      parts.torso.position.z = t * 1.5;
      break;

    case 'vrksasana':
      // Right leg bent up and out
      parts.rLeg.rotation.x = -Math.PI / 2.5;
      parts.rLeg.rotation.z = Math.PI / 3;
      parts.rCalf.rotation.x = Math.PI / 1.5;
      // Hands overhead
      parts.lArm.rotation.z = -Math.PI + 0.3;
      parts.rArm.rotation.z = Math.PI - 0.3;
      parts.lArm.rotation.x = 0.2;
      parts.rArm.rotation.x = 0.2;
      // Breathe
      parts.torso.position.y = 5 + (Math.sin(time * 0.5) * 0.2);
      break;

    case 'baddhakonaasana':
      mannequin.position.y = -3;
      parts.torso.position.y = 3 + (Math.sin(time * 0.5) * 0.2);

      parts.lLeg.rotation.x = -Math.PI / 2;
      parts.rLeg.rotation.x = -Math.PI / 2;
      parts.lLeg.rotation.z = -Math.PI / 3;
      parts.rLeg.rotation.z = Math.PI / 3;
      parts.lCalf.rotation.x = Math.PI / 1.2;
      parts.rCalf.rotation.x = Math.PI / 1.2;

      parts.lArm.rotation.z = -0.5;
      parts.lArm.rotation.x = -0.5;
      parts.lForearm.rotation.x = 0.5;
      parts.rArm.rotation.z = 0.5;
      parts.rArm.rotation.x = -0.5;
      parts.rForearm.rotation.x = 0.5;
      break;

    case 'situps':
      // Laying flat on ground
      mannequin.position.y = -3;
      mannequin.rotation.x = -Math.PI / 2;
      
      // Knees bent
      parts.lLeg.rotation.x = -Math.PI / 4;
      parts.rLeg.rotation.x = -Math.PI / 4;
      parts.lCalf.rotation.x = Math.PI / 2;
      parts.rCalf.rotation.x = Math.PI / 2;
      
      // Torso crunches up
      parts.torso.rotation.x = -t * Math.PI / 3;
      
      // Hands behind head
      parts.lArm.rotation.x = -Math.PI / 2;
      parts.rArm.rotation.x = -Math.PI / 2;
      parts.lArm.rotation.z = -Math.PI / 4;
      parts.rArm.rotation.z = Math.PI / 4;
      parts.lForearm.rotation.z = Math.PI / 1.5;
      parts.rForearm.rotation.z = -Math.PI / 1.5;
      break;

    case 'sidelunges':
      // Legs spread out
      parts.lLeg.rotation.z = -Math.PI / 5;
      parts.rLeg.rotation.z = Math.PI / 5;
      
      // One side bends based on time (t goes 0->1->0)
      // Let's do left side
      // Torso goes down directly but slightly sideways
      parts.torso.position.y = 5 - (t * 2.0);
      parts.torso.position.x = t * 1.5;
      
      // Right leg remains straight but angled
      // Left leg bends
      parts.lLeg.rotation.x = -t * Math.PI / 2.5;
      parts.lCalf.rotation.x = t * Math.PI / 2;
      
      // Slight forward lean to balance
      parts.torso.rotation.x = t * 0.3;
      
      // Arms out for balance
      parts.lArm.rotation.x = -t * 0.5;
      parts.rArm.rotation.x = -t * 0.5;
      break;

    case 'goodmornings':
      // Hinge at hips
      parts.torso.rotation.x = t * Math.PI / 2; // Lean forward
      // Slight knee bend
      parts.lLeg.rotation.x = -t * 0.2;
      parts.rLeg.rotation.x = -t * 0.2;
      parts.lCalf.rotation.x = t * 0.2;
      parts.rCalf.rotation.x = t * 0.2;
      
      // Hands behind head
      parts.lArm.rotation.x = -Math.PI / 2;
      parts.rArm.rotation.x = -Math.PI / 2;
      parts.lArm.rotation.z = -Math.PI / 4;
      parts.rArm.rotation.z = Math.PI / 4;
      parts.lForearm.rotation.z = Math.PI / 1.5;
      parts.rForearm.rotation.z = -Math.PI / 1.5;
      break;

    case 'armcircles':
      // Arms up at shoulder height
      parts.lArm.rotation.z = -Math.PI / 2;
      parts.rArm.rotation.z = Math.PI / 2;
      
      // Use time to rotate arms
      // t is 0-1 sinusoidal, let's use actual continuous time
      const circleT = time * 2; 
      parts.lArm.rotation.x = Math.sin(circleT) * 0.3;
      parts.lArm.rotation.y = Math.cos(circleT) * 0.3;
      parts.rArm.rotation.x = Math.sin(circleT) * 0.3;
      parts.rArm.rotation.y = Math.cos(circleT) * 0.3;
      break;

    case 'legraises':
      // Laying flat
      mannequin.position.y = -3;
      mannequin.rotation.x = -Math.PI / 2;
      
      // Legs straight, lifting up together
      parts.lLeg.rotation.x = t * Math.PI / 2 - Math.PI / 2; // Note: Torso rotation means hips are straight when parallel to torso
      // Wait torso is rotated by -PI/2. So legs at 0 means they are in line with torso (horizontal).
      parts.lLeg.rotation.x = -t * Math.PI / 2;
      parts.rLeg.rotation.x = -t * Math.PI / 2;
      
      // Arms at sides
      parts.lArm.rotation.z = 0.2;
      parts.rArm.rotation.z = -0.2;
      break;

    default:
      // Neutral standing pose
      break;
  }
}

/* ===========================
   API EXPORTS
   =========================== */
function update3DAnimation(exerciseId) {
  currentAnimExercise = exerciseId;
  // Reset sequence time to start fresh
  time = 0;
  if (mannequin) {
    mannequin.position.set(0, 0, 0);
    mannequin.rotation.set(0, 0, 0);
  }
}

function stop3DAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  // Optional: clear canvas to save resources
  if (renderer) {
    renderer.dispose();
  }
}

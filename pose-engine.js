/* ===========================
   POSE ENGINE — MediaPipe Pose (Solutions API)
   Reliable browser-based BlazePose integration
   =========================== */

import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";

window.poseLandmarker = null;
let cameraInstance = null;
let videoElement = null;
let canvasElement = null;
let canvasCtx = null;
let isRunning = false;
let lastPoseLandmarks = null;

// Callback for pose results
let onPoseResults = null;

window.initPoseEngine = async function(videoEl, canvasEl, callback) {
  videoElement = videoEl;
  canvasElement = canvasEl;
  canvasCtx = canvasEl.getContext('2d');
  onPoseResults = callback;

  const statusEl = document.getElementById('camera-status');
  if (statusEl) {
    statusEl.innerHTML = '<span class="dot"></span><span>Loading AI Model...</span>';
  }

  try {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
    
    // First attempt: GPU delegate
    try {
      window.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
          delegate: "GPU"
        },
        runningMode: "LIVE_STREAM",
        numPoses: 1
      });
      console.log("Pose Engine initialized with GPU delegate.");
    } catch (gpuErr) {
      console.warn("Pose Engine GPU delegate failed, falling back to CPU:", gpuErr);
      window.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
          delegate: "CPU"
        },
        runningMode: "LIVE_STREAM",
        numPoses: 1
      });
      console.log("Pose Engine initialized with CPU delegate.");
    }

    if (statusEl) {
      statusEl.innerHTML = '<span class="dot"></span><span>Starting Camera...</span>';
    }

    // Start camera using MediaPipe Camera Utils - optimized resolution
    cameraInstance = new Camera(videoElement, {
      onFrame: async () => {
        if (isRunning && window.poseLandmarker) {
          window.poseLandmarker.detectForVideo(videoElement, performance.now(), (result) => {
            handleResults(result);
          });
        }
      },
      width: 640,  // Lower resolution = MUCH lower latency
      height: 480
    });

    isRunning = true;
    await cameraInstance.start();

    if (statusEl) {
      statusEl.classList.add('recording');
      statusEl.innerHTML = '<span class="dot"></span><span>● LIVE</span>';
    }

  } catch (err) {
    console.error('Pose engine init error:', err);
    if (statusEl) {
      statusEl.innerHTML = '<span class="dot" style="background:var(--danger)"></span><span>Error: ' + err.message + '</span>';
    }
  }
}

function handleResults(results) {
  if (!canvasElement || !canvasCtx) return;

  // Match canvas to video dimensions
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.landmarks && results.landmarks.length > 0) {
    // New API returns an array of poses, each containing 33 landmarks
    const poseLandmarks = results.landmarks[0];
    lastPoseLandmarks = poseLandmarks;
    drawSkeleton(poseLandmarks);
    if (onPoseResults) onPoseResults(poseLandmarks);
  } else {
    lastPoseLandmarks = null;
    if (onPoseResults) onPoseResults(null);
  }

  canvasCtx.restore();
}

function drawSkeleton(landmarks) {
  const w = canvasElement.width;
  const h = canvasElement.height;

  // Connection pairs for skeleton
  const connections = [
    [11, 12], // shoulders
    [11, 13], [13, 15], // left arm
    [12, 14], [14, 16], // right arm
    [11, 23], [12, 24], // torso sides
    [23, 24], // hips
    [23, 25], [25, 27], // left leg
    [24, 26], [26, 28], // right leg
    [15, 17], [15, 19], [15, 21], // left hand
    [16, 18], [16, 20], [16, 22], // right hand
    [27, 29], [27, 31], // left foot
    [28, 30], [28, 32], // right foot
  ];

  // Draw connections with gradient
  canvasCtx.lineWidth = 4;
  connections.forEach(([i, j]) => {
    const a = landmarks[i], b = landmarks[j];
    if (!a || !b || a.visibility < 0.3 || b.visibility < 0.3) return;

    const ax = a.x * w, ay = a.y * h;
    const bx = b.x * w, by = b.y * h;

    const gradient = canvasCtx.createLinearGradient(ax, ay, bx, by);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.9)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.9)');
    canvasCtx.strokeStyle = gradient;
    canvasCtx.beginPath();
    canvasCtx.moveTo(ax, ay);
    canvasCtx.lineTo(bx, by);
    canvasCtx.stroke();
  });

  // Draw landmarks
  landmarks.forEach((lm, idx) => {
    if (idx > 32 || lm.visibility < 0.3) return;
    const x = lm.x * w;
    const y = lm.y * h;

    // Glow effect
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, 9, 0, 2 * Math.PI);
    canvasCtx.fillStyle = 'rgba(124, 58, 237, 0.25)';
    canvasCtx.fill();

    // Main dot
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
    // Color by body region
    if (idx <= 10) canvasCtx.fillStyle = '#a78bfa'; // face
    else if (idx <= 16) canvasCtx.fillStyle = '#06b6d4'; // arms
    else if (idx <= 22) canvasCtx.fillStyle = '#22d3ee'; // hands
    else canvasCtx.fillStyle = '#f472b6'; // lower body
    canvasCtx.fill();

    // White center
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, 2, 0, 2 * Math.PI);
    canvasCtx.fillStyle = '#ffffff';
    canvasCtx.fill();
  });
}

window.stopPoseEngine = function() {
  isRunning = false;

  if (cameraInstance) {
    cameraInstance.stop();
    cameraInstance = null;
  }

  if (window.poseLandmarker) {
    window.poseLandmarker.close();
    window.poseLandmarker = null;
  }

  if (videoElement && videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach(t => t.stop());
    videoElement.srcObject = null;
  }

  lastPoseLandmarks = null;
}

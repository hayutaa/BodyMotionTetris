const video = document.getElementById("videoPreview");
const cameraSelect = document.getElementById("cameraSelect");
const testCameraButton = document.getElementById("testCameraButton");
const canvas = document.getElementById("poseCanvas");
const ctx = canvas.getContext("2d");

let detector;

// Kamera-Stream starten
async function startStream(deviceId) {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
      },
    });

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      loadBlazePose();
    };

    console.log(`Kamera gestartet mit ID: ${deviceId || "Standardkamera"}`);
  } catch (err) {
    console.error("Fehler beim Zugriff auf die Kamera:", err);
    alert("Die Kamera konnte nicht gestartet werden.");
    listCameras();
  }
}

async function listCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );

    cameraSelect.innerHTML = "";

    videoDevices.forEach((device, index) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || `Kamera ${index + 1}`;
      cameraSelect.appendChild(option);
    });

    // Wähle die gespeicherte Kamera, falls verfügbar
    const savedCameraId = localStorage.getItem("selectedCameraId");
    if (
      savedCameraId &&
      videoDevices.some((device) => device.deviceId === savedCameraId)
    ) {
      cameraSelect.value = savedCameraId;
      startStream(savedCameraId);
    } else if (videoDevices.length > 0) {
      startStream(videoDevices[0].deviceId);
    }
  } catch (err) {
    console.error("Fehler beim Abrufen der Kameraliste:", err);
  }
}

// BlazePose-Modell laden
async function loadBlazePose() {
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: "mediapipe",
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
    modelType: "full",
  };

  detector = await poseDetection.createDetector(model, detectorConfig);
  console.log("BlazePose wurde erfolgreich geladen!");
  detectPose();
}

// Pose erkennen und zeichnen
async function detectPose() {
  const poses = await detector.estimatePoses(video);
  drawPose(poses);
  requestAnimationFrame(detectPose);
}

// Keypoints zeichnen
function drawPose(poses) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (poses.length > 0) {
    const BODY_KEYPOINTS = [3, 4, 11, 12, 15, 16];

    poses[0].keypoints.forEach((point, index) => {
      if (BODY_KEYPOINTS.includes(index) && point.score > 0.5) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  }
}

// Globale Variablen
let lastLeftHandX = null;
let lastRightHandX = null;
let handsDownTime = 0; // Zeit, wie lange die Hände unten bleiben
let lastRotationTime = 0; // Zeitstempel der letzten Rotation
const HOLD_DURATION = 1000; // Dauer für Hard Drop (in Millisekunden)
const SMOOTHING_THRESHOLD = 20; // Schwelle für Handbewegung in Pixeln
const FRAME_TIME = 16; // Zeit pro Frame (ca. 60 FPS)
const EAR_TILT_THRESHOLD = 15; // Schwelle für Kopfneigung in Pixeln
const ROTATION_DELAY = 500; // Mindestzeit zwischen zwei Rotationen (in Millisekunden)

async function detectPose() {
  const poses = await detector.estimatePoses(video);
  if (poses.length > 0) {
    const keypoints = poses[0].keypoints;

    const leftHand = keypoints[15]; // Linke Hand
    const rightHand = keypoints[16]; // Rechte Hand
    const leftEar = keypoints[3]; // Linkes Ohr
    const rightEar = keypoints[4]; // Rechtes Ohr

    handleHandMovement(leftHand, "left");

    handleHandMovement(rightHand, "right");

    handleHardDrop(leftHand, rightHand);

    handleHeadTilt(leftEar, rightEar);
  }

  drawPose(poses);
  requestAnimationFrame(detectPose);
}

// Block nach rechts/links
function handleHandMovement(hand, direction) {
  if (hand.score > 0.5) {
    const lastHandX = direction === "left" ? lastLeftHandX : lastRightHandX;
    if (
      lastHandX === null ||
      Math.abs(hand.x - lastHandX) > SMOOTHING_THRESHOLD
    ) {
      if (direction === "left") {
        moveLeft();
        lastLeftHandX = hand.x;
      } else {
        moveRight();
        lastRightHandX = hand.x;
      }
    }
  }
}

//Hard Drop
function handleHardDrop(leftHand, rightHand) {
  const bothHandsDown =
    leftHand.score > 0.5 &&
    rightHand.score > 0.5 &&
    leftHand.y > (2 * canvas.height) / 3 &&
    rightHand.y > (2 * canvas.height) / 3;

  if (bothHandsDown) {
    handsDownTime += FRAME_TIME;
    if (handsDownTime >= HOLD_DURATION) {
      hardDrop();
      handsDownTime = 0;
    }
  } else {
    handsDownTime = 0;
  }
}

//Block drehen
function handleHeadTilt(leftEar, rightEar) {
  if (leftEar.score > 0.5 && rightEar.score > 0.5) {
    const tilt = leftEar.y - rightEar.y;
    const currentTime = Date.now();

    if (
      tilt > EAR_TILT_THRESHOLD &&
      currentTime - lastRotationTime > ROTATION_DELAY
    ) {
      rotateTetromino();
      lastRotationTime = currentTime;
    }
  }
}

// Kamera auswählen
cameraSelect.onchange = () => {
  const selectedCameraId = cameraSelect.value;
  localStorage.setItem("selectedCameraId", selectedCameraId); // Speichere die neue ID
  startStream(selectedCameraId);
};

window.onload = () => {
  listCameras();
};

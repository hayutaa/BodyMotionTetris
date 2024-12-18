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
    const BODY_KEYPOINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

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

// Kamera auswählen (Dropdown-Ereignis)
cameraSelect.onchange = () => {
  const selectedCameraId = cameraSelect.value;
  localStorage.setItem("selectedCameraId", selectedCameraId); // Speichere die neue ID
  startStream(selectedCameraId);
};

// Initialisierung
window.onload = () => {
  listCameras(); // Kameras auflisten und Starten
};

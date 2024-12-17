const video = document.getElementById('videoPreview');
const cameraSelect = document.getElementById('cameraSelect');
const testCameraButton = document.getElementById('testCameraButton');
const canvas = document.getElementById('poseCanvas');
const ctx = canvas.getContext('2d');

let detector;

// Starte Kamera-Stream
async function startStream(deviceId) {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
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
  } catch (err) {
    console.error('Fehler beim Zugriff auf die Kamera:', err);
    alert('Die Kamera konnte nicht gestartet werden.');
  }
}

// BlazePose-Modell laden
async function loadBlazePose() {
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
    modelType: 'full',
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

// Nur Körperpunkte zeichnen
function drawPose(poses) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leeren

  if (poses.length > 0) {
    const BODY_KEYPOINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

    // Skalierungsfaktoren berechnen
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    poses[0].keypoints.forEach((point, index) => {
      if (BODY_KEYPOINTS.includes(index) && point.score > 0.5) {
        // Keypoint-Koordinaten an die Canvas-Größe anpassen
        const x = point.x * scaleX;
        const y = point.y * scaleY;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  }
}


// Kameras auflisten
async function listCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    cameraSelect.innerHTML = '';

    videoDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Kamera ${index + 1}`;
      cameraSelect.appendChild(option);
    });

    if (videoDevices.length > 0) {
      startStream(videoDevices[0].deviceId);
    }
  } catch (err) {
    console.error('Fehler beim Abrufen der Kameraliste:', err);
  }
}

cameraSelect.onchange = () => startStream(cameraSelect.value);

testCameraButton.addEventListener('click', () => {
  if (!cameraSelect.value) {
    alert('Bitte wähle zuerst eine Kamera aus.');
  } else {
    startStream(cameraSelect.value);
  }
});

// Initialisiere Kameraliste
listCameras();

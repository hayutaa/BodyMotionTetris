const video = document.getElementById('videoPreview');
const canvas = document.getElementById('keypointsCanvas');
const ctx = canvas.getContext('2d');
let net;

// Zurück-Navigation
function goBack() {
  window.location.href = 'index.html';
}

// Kamera einrichten
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// PoseNet initialisieren
async function loadPoseNet() {
  net = await posenet.load();
  console.log("PoseNet Modell geladen!");
  detectPose();
}

// Pose-Erkennung
async function detectPose() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const pose = await net.estimateSinglePose(video, {
    flipHorizontal: false,
  });

  // Zeichne Keypoints auf dem Canvas
  drawKeypoints(pose.keypoints);

  // Zeige Koordinaten in der Konsole
  console.log("Koordinaten der Person:", pose.keypoints);

  requestAnimationFrame(detectPose);
}

// Keypoints zeichnen
function drawKeypoints(keypoints) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  keypoints.forEach((keypoint) => {
    if (keypoint.score > 0.5) { // Nur zuverlässige Keypoints anzeigen
      const { x, y } = keypoint.position;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
  });
}

// Kamera starten und PoseNet laden
document.getElementById('testCameraButton').addEventListener('click', async () => {
  await setupCamera();
  await loadPoseNet();
});

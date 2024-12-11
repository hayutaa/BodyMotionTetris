const video = document.getElementById('videoPreview');
const cameraSelect = document.getElementById('cameraSelect');
const testCameraButton = document.getElementById('testCameraButton');

// Funktion: Kamerastream starten
async function startStream(deviceId) {
  // Vorherigen Stream stoppen
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: deviceId ? { exact: deviceId } : undefined }
    });
    video.srcObject = stream;
    video.style.display = 'block';
  } catch (err) {
    console.error('Fehler beim Zugriff auf die Kamera:', err);
    alert('Die ausgewählte Kamera konnte nicht gestartet werden.');
  }
}

// Funktion: Kameras auflisten
async function listCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    cameraSelect.innerHTML = ''; // Kameraauswahl leeren

    videoDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Kamera ${index + 1}`;
      cameraSelect.appendChild(option);
    });

    // Standardmäßig die erste Kamera starten
    if (videoDevices.length > 0) {
      startStream(videoDevices[0].deviceId);
    }
  } catch (err) {
    console.error('Fehler beim Abrufen der Kameraliste:', err);
    alert('Es konnten keine Kameras gefunden werden.');
  }
}

// Event: Kamera wechseln
cameraSelect.onchange = () => startStream(cameraSelect.value);

// Event: Kamera testen
testCameraButton.addEventListener('click', () => {
  if (!cameraSelect.value) {
    alert('Bitte wähle zuerst eine Kamera aus.');
  } else {
    startStream(cameraSelect.value);
  }
});

// Kameras initialisieren
listCameras();

// Funktion: Spiel starten
function startGame() {
  if (!video.srcObject) {
    alert('Bitte wähle eine Kamera aus und teste sie zuerst!');
    return;
  }
  // Weiterleitung oder Integration des Streams ins Spiel
  window.location.href = 'game.html';
}

const toggleMirrorButton = document.getElementById('toggleMirror');
let isMirrored = true;

toggleMirrorButton.addEventListener('click', () => {
  isMirrored = !isMirrored;
  video.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
});


import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";

/*
 * ESTACIÓN ABISMO
 * Taller: Medios, Animación y Audio Espacial en Three.js
 * Concepto: un módulo de transmisión oceánica en el fondo del mar.
 * El "ojo de buey" del módulo reproduce un video (textura de video),
 * el módulo emite un sonar de audio posicional, y el entorno
 * (corales, algas, burbujas) se anima en un bucle continuo a 60 FPS.
 */

// ---------------------------------------------------------------------------
// Escena, cámara y renderizador
// ---------------------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x021826);
scene.fog = new THREE.FogExp2(0x021826, 0.045);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2.4, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById("app").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.5; // acercarse hasta casi tocar el módulo
controls.maxDistance = 22; // alejarse hasta perder el sonar
controls.maxPolarAngle = Math.PI * 0.53; // no cruzar el "piso" marino
controls.target.set(0, 1.6, 0);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------------
// Iluminación submarina
// ---------------------------------------------------------------------------
const hemi = new THREE.HemisphereLight(0x2a5d7c, 0x030a08, 0.9);
scene.add(hemi);

const sunShaft = new THREE.DirectionalLight(0x6fb8e0, 0.35);
sunShaft.position.set(-4, 12, -3);
scene.add(sunShaft);

const podLight = new THREE.PointLight(0x5be0ff, 4.5, 14, 2);
podLight.position.set(0, 2.4, 1.1);
scene.add(podLight);

// ---------------------------------------------------------------------------
// Suelo marino
// ---------------------------------------------------------------------------
const groundGeo = new THREE.CircleGeometry(30, 64);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0d2418,
  roughness: 1,
  metalness: 0,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

// ---------------------------------------------------------------------------
// Módulo de transmisión (objeto principal)
// ---------------------------------------------------------------------------
const pod = new THREE.Group();
pod.position.set(0, 1.6, 0);
scene.add(pod);

const hullMat = new THREE.MeshStandardMaterial({
  color: 0xc7d3d6,
  metalness: 0.85,
  roughness: 0.35,
});
const trimMat = new THREE.MeshStandardMaterial({
  color: 0xff8a3d,
  metalness: 0.4,
  roughness: 0.5,
});

// Cilindro con tapas planas: las tapas sirven de superficie para montar
// el ojo de buey al ras, sin quedar encajado dentro de una punta curva.
const hull = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.4, 20, 1, false), hullMat);
hull.rotation.z = Math.PI / 2;
pod.add(hull);

const capMat = new THREE.MeshStandardMaterial({
  color: 0x9fb0b4,
  metalness: 0.8,
  roughness: 0.4,
});
const capFront = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), capMat);
capFront.position.x = 1.7;
capFront.rotation.y = Math.PI / 2;
pod.add(capFront);

const capBack = capFront.clone();
capBack.position.x = -1.7;
capBack.rotation.y = -Math.PI / 2;
pod.add(capBack);

const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.06, 8, 24), trimMat);
ring1.rotation.y = Math.PI / 2;
ring1.position.x = 1.0;
pod.add(ring1);

const ring2 = ring1.clone();
ring2.position.x = -1.0;
pod.add(ring2);

// Ojo de buey / pantalla de video
const videoEl = document.createElement("video");
videoEl.src = "/assets/video.mp4";
videoEl.loop = true;
videoEl.muted = true; // el audio real llega por PositionalAudio
videoEl.playsInline = true;
videoEl.crossOrigin = "anonymous";

const videoTexture = new THREE.VideoTexture(videoEl);
videoTexture.colorSpace = THREE.SRGBColorSpace;

const portholeFrame = new THREE.Mesh(
  new THREE.TorusGeometry(0.62, 0.08, 12, 32),
  trimMat
);
portholeFrame.position.set(1.71, 0, 0);
portholeFrame.rotation.y = Math.PI / 2;
pod.add(portholeFrame);

const screenMesh = new THREE.Mesh(
  new THREE.CircleGeometry(0.58, 32),
  new THREE.MeshBasicMaterial({ map: videoTexture, toneMapped: false })
);
screenMesh.position.set(1.73, 0, 0);
screenMesh.rotation.y = Math.PI / 2;
pod.add(screenMesh);

// Antena con luz de baliza (parte del objeto principal que se anima)
const antenna = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.06, 1.4, 8),
  trimMat
);
antenna.position.set(0, 1.35, 0);
pod.add(antenna);

const beaconMat = new THREE.MeshStandardMaterial({
  color: 0xff4d4d,
  emissive: 0xff2222,
  emissiveIntensity: 1,
});
const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), beaconMat);
beacon.position.set(0, 2.1, 0);
pod.add(beacon);

// ---------------------------------------------------------------------------
// Fuente de audio posicional (el "sonar" del módulo)
// ---------------------------------------------------------------------------
const listener = new THREE.AudioListener();
camera.add(listener);

const sonar = new THREE.PositionalAudio(listener);
sonar.setRefDistance(2.2);
sonar.setMaxDistance(20);
sonar.setRolloffFactor(1.6);
sonar.setDistanceModel("exponential");
sonar.setLoop(true);
sonar.setVolume(0.9);
pod.add(sonar);

const audioLoader = new THREE.AudioLoader();
audioLoader.load("/assets/audio.mp3", (buffer) => {
  sonar.setBuffer(buffer);
});

// ---------------------------------------------------------------------------
// Ambientación: corales, rocas y algas (3+ elementos adicionales)
// ---------------------------------------------------------------------------
const corals = new THREE.Group();
scene.add(corals);

const coralPalette = [0xff5da2, 0xff9f4d, 0x7ef2c3];
for (let i = 0; i < 6; i++) {
  const mat = new THREE.MeshStandardMaterial({
    color: coralPalette[i % coralPalette.length],
    emissive: coralPalette[i % coralPalette.length],
    emissiveIntensity: 0.25,
    roughness: 0.6,
  });
  const geo =
    i % 2 === 0
      ? new THREE.TorusKnotGeometry(0.35, 0.12, 64, 8, 2, 3)
      : new THREE.IcosahedronGeometry(0.4, 0);
  const coral = new THREE.Mesh(geo, mat);
  const angle = (i / 6) * Math.PI * 2;
  const radius = 4.2 + (i % 2) * 1.4;
  coral.position.set(Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius);
  coral.scale.setScalar(0.8 + Math.random() * 0.6);
  coral.userData.spin = 0.15 + Math.random() * 0.25;
  coral.userData.bobOffset = Math.random() * Math.PI * 2;
  corals.add(coral);
}

const rockMat = new THREE.MeshStandardMaterial({
  color: 0x33403f,
  roughness: 1,
});
const rocks = new THREE.Group();
scene.add(rocks);
for (let i = 0; i < 10; i++) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.35, 0), rockMat);
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 9;
  rock.position.set(Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius);
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  rocks.add(rock);
}

const seaweedMat = new THREE.MeshStandardMaterial({
  color: 0x1f8a5f,
  side: THREE.DoubleSide,
  roughness: 0.8,
});
const seaweedPatches = [];
for (let i = 0; i < 14; i++) {
  const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.6 + Math.random()), seaweedMat);
  const angle = Math.random() * Math.PI * 2;
  const radius = 2.6 + Math.random() * 8;
  blade.position.set(Math.cos(angle) * radius, 0.8, Math.sin(angle) * radius);
  blade.rotation.y = Math.random() * Math.PI;
  blade.geometry.translate(0, 0.8, 0); // pivote en la base
  blade.userData.swaySpeed = 0.8 + Math.random() * 0.6;
  blade.userData.swayOffset = Math.random() * Math.PI * 2;
  scene.add(blade);
  seaweedPatches.push(blade);
}

// ---------------------------------------------------------------------------
// Burbujas ascendentes (InstancedMesh animado en el bucle)
// ---------------------------------------------------------------------------
const BUBBLE_COUNT = 80;
const bubbleGeo = new THREE.SphereGeometry(0.06, 8, 8);
const bubbleMat = new THREE.MeshStandardMaterial({
  color: 0xbdf3ff,
  transparent: true,
  opacity: 0.55,
  roughness: 0.1,
  metalness: 0,
});
const bubbles = new THREE.InstancedMesh(bubbleGeo, bubbleMat, BUBBLE_COUNT);
scene.add(bubbles);

const bubbleData = [];
const dummy = new THREE.Object3D();
for (let i = 0; i < BUBBLE_COUNT; i++) {
  const data = {
    x: (Math.random() - 0.5) * 8,
    z: (Math.random() - 0.5) * 8,
    y: Math.random() * 10,
    speed: 0.4 + Math.random() * 0.8,
    scale: 0.4 + Math.random() * 1,
    wobble: Math.random() * Math.PI * 2,
  };
  bubbleData.push(data);
  dummy.position.set(data.x, data.y, data.z);
  dummy.scale.setScalar(data.scale);
  dummy.updateMatrix();
  bubbles.setMatrixAt(i, dummy.matrix);
}

// ---------------------------------------------------------------------------
// Interacción de usuario: play / pausa (botón + tecla espacio)
// ---------------------------------------------------------------------------
const toggleBtn = document.getElementById("toggleBtn");
let playing = false;

function setPlaying(next) {
  playing = next;
  if (playing) {
    videoEl.play().catch(() => {});
    if (listener.context.state === "suspended") listener.context.resume();
    if (sonar.buffer && !sonar.isPlaying) sonar.play();
    toggleBtn.textContent = "⏸ Pausar transmisión";
    toggleBtn.classList.add("playing");
  } else {
    videoEl.pause();
    if (sonar.isPlaying) sonar.pause();
    toggleBtn.textContent = "▶ Iniciar transmisión (video + audio)";
    toggleBtn.classList.remove("playing");
  }
}

toggleBtn.addEventListener("click", () => setPlaying(!playing));
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    setPlaying(!playing);
  }
});

// ---------------------------------------------------------------------------
// Bucle de animación (60 FPS vía requestAnimationFrame)
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const t = clock.elapsedTime;

  // Módulo: leve cabeceo y giro lento, como si flotara anclado
  pod.position.y = 1.6 + Math.sin(t * 0.5) * 0.08;
  pod.rotation.y += delta * 0.05;

  // Baliza parpadeante
  beacon.material.emissiveIntensity = 0.6 + Math.sin(t * 3.2) * 0.6;
  podLight.intensity = 4.2 + Math.sin(t * 6) * 0.4 + Math.sin(t * 13) * 0.15;

  // Corales: rotación y respiración suave
  corals.children.forEach((coral) => {
    coral.rotation.y += delta * coral.userData.spin;
    coral.position.y = 0.4 + Math.sin(t + coral.userData.bobOffset) * 0.08;
  });

  // Algas: balanceo tipo corriente marina
  seaweedPatches.forEach((blade) => {
    blade.rotation.z = Math.sin(t * blade.userData.swaySpeed + blade.userData.swayOffset) * 0.25;
  });

  // Burbujas: ascienden y reinician desde el fondo
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const d = bubbleData[i];
    d.y += delta * d.speed;
    if (d.y > 9.5) d.y = 0;
    const wob = Math.sin(t * 2 + d.wobble) * 0.15;
    dummy.position.set(d.x + wob, d.y, d.z);
    dummy.scale.setScalar(d.scale);
    dummy.updateMatrix();
    bubbles.setMatrixAt(i, dummy.matrix);
  }
  bubbles.instanceMatrix.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
}

animate();

// -----------
// CONSTANTS
// -----------
const webcamEl = document.querySelector("#webcam");
const liveView = document.querySelector("#liveView");
const meetingParticipantsElement = document.getElementById("meeting-participants");

let webcam;
let model;
let timer;
const global_participants = parseInt(meetingParticipantsElement.textContent);
let participants = 0;
const grace_period = 30; // seconds

// -----------
// AUX FUNCTIONS
// -----------
function initTFJS() {
  if (typeof tf === "undefined") {
    throw new Error("TensorFlow.js not loaded");
  }
}

function getUserMediaSupported() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function startGracePeriod() {

  console.log(global_participants, participants);
  // Inicializar el contenido con el formato "actual/total participantes"
  meetingParticipantsElement.textContent = `Grace period`;

  timer = setTimeout(() => {
    console.log(global_participants, participants);
    // Comprobar si faltan participantes después del periodo de gracia
    if (participants < global_participants) { // Cambia '5' por el número esperado de participantes
      meetingParticipantsElement.textContent = `${participants}/${global_participants} participantes`;
      alert(`Faltan ${global_participants - participants} participantes.`);
    }
  }, grace_period * 1000); // Convierte segundos a milisegundos
}

async function loadCocoSsdModel() {
  model = await cocoSsd.load();
  console.log("Coco loaded.");
}


// -----------
// PREDICT
// -----------
const Items = ["person"];
const detectedItems = {
  person: false
};

async function predictCoco() {
  const objects = [];
  let aux_participants = 0;
  while (true) {
    const frame = await webcam.capture();
    const predictions = await model.detect(frame);

    // Clear previous annotations
    objects.forEach((object) => {
      if (liveView.contains(object)) {
          liveView.removeChild(object);
      }
  });
    objects.length = 0;
    aux_participants = 0;

    for (let n = 0; n < predictions.length; n++) {
      aux_participants += 1
      const prediction = predictions[n];
      const item = prediction.class;
      //console.log(prediction);

      // Mostrar solo items en nuestra lista de items y cuya confianza es suficiente
      if (prediction.score > 0.2 && Items.includes(item)) {

        //console.log(`Detected item: ${item}`);
        if (Items.includes(item)) {
          detectedItems[item] = true;
        }

        // Mostrar caja del item
        const p = createAnnotation(prediction, aux_participants);
        const highlighter = createHighlighter(prediction);

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        objects.push(highlighter);
        objects.push(p);
      }
    }

    console.log("COCO objects: ", objects)
    participants = Math.max(participants, aux_participants);
    frame.dispose();
    await tf.nextFrame();
  }
}


// -----------
// AUX STYLES
// -----------
function createAnnotation(prediction, num_participant) {
  const xmin = prediction.bbox[0];
  const ymin = prediction.bbox[1];
  const xmax = prediction.bbox[0] + prediction.bbox[2];

  const p = document.createElement("p");
  p.classList.add("text-coco");
  p.innerText = `${prediction.class} ${num_participant}`;
  p.style.left   = `${xmin}px`;
  p.style.top    = `${ymin}px`;
  p.style.width  = `${xmax - xmin}px`;
  p.style.height = `15px`;
  p.style.borderRadius = "4px";
  return p;
}


function createHighlighter(prediction) {
  const xmin = prediction.bbox[0];
  const ymin = prediction.bbox[1];
  const xmax = prediction.bbox[0] + prediction.bbox[2];
  const ymax = prediction.bbox[1] + prediction.bbox[3];

  const box = document.createElement("div");
  // Establecer estilos en el highlighter
  box.classList.add("highlighter-coco");
  box.style.left   = `${xmin}px`;
  box.style.top    = `${ymin + 12}px`;
  box.style.width  = `${xmax - xmin}px`;
  box.style.height = `${ymax - ymin -12}px`;
  box.style.borderRadius = "12px";

  return box;
}

// -----------
// APP
// -----------
// Función principal de COCO-SSD
async function cocoApp() {
  await loadCocoSsdModel(); // Carga el modelo
  webcam = await tf.data.webcam(webcamEl); // Activa la cámara
  await predictCoco(); // Inicia la predicción con la webcam
}

// -----------
// INIT APP
// -----------
export async function initCocoApp() {
  try {
    initTFJS(); // Inicializa TensorFlow.js
    await cocoApp(); // Llama a la función principal de la aplicación
  } catch (error) {
    console.error(error);
  }
}

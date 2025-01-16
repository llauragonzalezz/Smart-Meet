// -----------
// CONSTANTS
// -----------
const webcamEl = document.querySelector("#webcam");
const liveView = document.querySelector("#liveView");

let webcam;
let model;
let participants;

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

async function predictWebcam() {
  const objects = [];
  while (true) {
    const frame = await webcam.capture();
    const predictions = await model.detect(frame);

    // Clear previous annotations
    objects.forEach((object) => liveView.removeChild(object));
    objects.length = 0;
    participants = 0;

    for (let n = 0; n < predictions.length; n++) {
      participants += 1
      const prediction = predictions[n];
      const item = prediction.class;
      //console.log(prediction);

      // Mostrar solo items en nuestra lista de items y cuya confianza es suficiente
      if (prediction.score > 0.2 && Items.includes(item)) {

        console.log(`Detected item: ${item}`);
        if (Items.includes(item)) {
          detectedItems[item] = true;
        }

        // Mostrar caja del item
        const p = createAnnotation(prediction);
        const highlighter = createHighlighter(prediction);

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        objects.push(highlighter);
        objects.push(p);
      }
    }

    frame.dispose();
    await tf.nextFrame();
  }
}


// -----------
// AUX STYLES
// -----------
function createAnnotation(prediction) {
  const p = document.createElement("p");
  const [x, y] = prediction.bbox;
  p.innerText = `${prediction.class} - ${Math.round(prediction.score * 100)}% confidence.`;
  const rect = webcamEl.getBoundingClientRect();

  // Limitar las coordenadas del highlighter dentro del contenedor
  const left = Math.max(rect.left, prediction.bbox[0]);
  const top = Math.max(rect.top-4, prediction.bbox[1] - 15);
  const right = Math.min(rect.right, prediction.bbox[0] + prediction.bbox[2]);
  const bottom = Math.min(rect.bottom, prediction.bbox[1] + prediction.bbox[3]);

  // Calcular las dimensiones ajustadas
  const width = right - left; // Asegurar que no exceda el contenedor

  // Establecer estilos en el highlighter
  p.style.left = `${left}px`;
  p.style.top = `${top}px`;
  p.style.width = `${width}px`;
  p.style.height = `20px`;  
  p.style.borderRadius = "4px";
  return p;
}


function createHighlighter(prediction) {
  const highlighter = document.createElement("div");
  highlighter.setAttribute("class", "highlighter");
  const rect = webcamEl.getBoundingClientRect();

  // Limitar las coordenadas del highlighter dentro del contenedor
  const left = Math.max(rect.left, prediction.bbox[0]);
  const top = Math.max(rect.top+7, prediction.bbox[1]) + 13;
  const right = Math.min(rect.right, prediction.bbox[0] + prediction.bbox[2]);
  const bottom = Math.max(rect.bottom, prediction.bbox[1] + prediction.bbox[3]) - 15;

  // Calcular las dimensiones ajustadas
  const width = right - left; // Asegurar que no exceda el contenedor
  const height = bottom - top + 25; // Asegurar que no exceda el contenedor

  // Establecer estilos en el highlighter
  highlighter.style.left = `${left}px`;
  highlighter.style.top = `${top}px`;
  highlighter.style.width = `${width}px`;
  highlighter.style.height = `${height}px`;
  highlighter.style.borderRadius = "12px";
  return highlighter;
}

// -----------
// APP
// -----------
async function app() {
  await loadCocoSsdModel(); // Load the model if webcam support is confirmed
  webcam = await tf.data.webcam(webcamEl); // Start the webcam stream
  await predictWebcam(); // Start the webcam prediction
}

// -----------
// INIT APP
// -----------
(async function initApp() {

  try {
    initTFJS();
    await app();
  } catch (error) {
    console.error(error);
  }

}());




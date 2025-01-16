import { AutoModel, AutoProcessor, RawImage } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@latest';

const webcamEl = document.querySelector("#webcam");
const liveView = document.querySelector("#liveView");

let webcam;
let model;
let processor;
let timer;
const global_participants = 5;
let participants = 0;
const grace_period = 30; // seconds

function initTFJS() {
  if (typeof tf === "undefined") {
    throw new Error("TensorFlow.js not loaded");
  }
}

function getUserMediaSupported() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function startGracePeriod() {
  timer = setTimeout(() => {
    console.log(global_participants, participants);
    // Comprobar si faltan participantes después del periodo de gracia
    if (participants < global_participants) { // Cambia '5' por el número esperado de participantes
      alert(`Faltan ${global_participants - participants} participantes.`);
    }
  }, grace_period * 1000); // Convierte segundos a milisegundos
}


async function loadYolov10Model() {
  model = await AutoModel.from_pretrained('onnx-community/yolov10n', {})
  processor = await AutoProcessor.from_pretrained('onnx-community/yolov10n');
  console.log("Yolov10 loaded!")
}


async function predictYolo() {
  const objects = [];
  let aux_participants = 0;
  while (true) {
    const frame = await webcam.capture();

    // Convertir el tensor capturado a un formato legible por RawImage
    const canvas = document.createElement("canvas");
    canvas.width = frame.shape[1];
    canvas.height = frame.shape[0];
    await tf.browser.toPixels(frame, canvas);
    const imageDataUrl = canvas.toDataURL();
    const image = await RawImage.read(imageDataUrl);

    // Procesar la imagen
    const { pixel_values, reshaped_input_sizes } = await processor(image);
    const { output0 } = await model({ images: pixel_values });
    const predictions = output0.tolist()[0];

    canvas.remove();
    objects.forEach((object) => {
      if (liveView.contains(object)) {
          liveView.removeChild(object);
      }
    });
    objects.length = 0;
    aux_participants = 0;

    const threshold = 0.4;
    for (const [xmin, ymin, xmax, ymax, score, id] of predictions) {
      
      if (score >= threshold && model.config.id2label[id] == "person") {
        //console.log(model.config.id2label[id], score);
        // Bounding box
        aux_participants += 1;

        const p = document.createElement("p");
        p.classList.add("text-yolo");
        p.innerText = `${model.config.id2label[id]} ${aux_participants}`;
        p.style.left   = `${xmin}px`;
        p.style.top    = `${ymin}px`;
        p.style.width  = `${xmax - xmin}px`;
        p.style.height = `15px`;
        p.style.borderRadius = "4px";

        const box = document.createElement("div");
        box.classList.add("highlighter-yolo");
        box.style.left   = `${xmin}px`;
        box.style.top    = `${ymin + 12}px`;
        box.style.width  = `${xmax - xmin}px`;
        box.style.height = `${ymax - ymin -12}px`;
        box.style.borderRadius = "12px";
        
        liveView.appendChild(box);
        liveView.appendChild(p);
        objects.push(box);
        objects.push(p);
      }
    }


    console.log("YOLO objects: ", objects);
    participants = Math.max(participants, aux_participants);
    frame.dispose();
    await tf.nextFrame();
  }
}

// -----------
// APP
// -----------
async function yoloApp() {
  if (!getUserMediaSupported()) {
    console.warn("getUserMedia() no es compatible con tu navegador");
    return;
  }

  webcam = await tf.data.webcam(webcamEl);
  startGracePeriod();
  await loadYolov10Model(); // Carga el modelo YOLO
  await predictYolo();
}

// -----------
// INIT APP
// -----------
export async function initYoloApp() {
  try {
    initTFJS(); // Inicializa TensorFlow.js
    await yoloApp(); // Llama a la función principal encapsulada
  } catch (error) {
    console.error(error);
  }
}




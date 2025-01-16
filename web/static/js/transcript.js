const WHISPER_SAMPLING_RATE = 16000;
const MAX_AUDIO_LENGTH = 3; // seconds
const MAX_SAMPLES = WHISPER_SAMPLING_RATE * MAX_AUDIO_LENGTH;

let language = 'es';
const timeDataQueue = [];
const outputMessageEl = document.querySelector('#transcript-text');

let audioContext;
let stream;
let recorder;
let isWorkerReady = false; // Bandera para controlar si el modelo está listo

(async function app() {
    if (navigator.mediaDevices.getUserMedia) {
        stream = await getAudioStream();
        if (!stream) {
            console.error("Unable to get audio stream.");
            return;
        }

        audioContext = new AudioContext({
            latencyHint: "playback",
            sampleRate: WHISPER_SAMPLING_RATE
        });
        const streamSource = audioContext.createMediaStreamSource(stream);

        await audioContext.audioWorklet.addModule("static/js/recorder.worklet.js");
        recorder = new AudioWorkletNode(audioContext, "recorder.worklet");
        streamSource.connect(recorder).connect(audioContext.destination);

        // Process audio data from the recorder
        recorder.port.onmessage = async (e) => {
            const inputBuffer = Array.from(e.data);
            if (!inputBuffer.length || inputBuffer[0] === 0) return;

            timeDataQueue.push(...inputBuffer);

            if (timeDataQueue.length >= MAX_SAMPLES) {
                processAudio();
            }
        };

        // Automatically process audio every 2 seconds
        setInterval(() => {
            if (timeDataQueue.length >= MAX_SAMPLES) {
                processAudio();
                //timeDataQueue.length = 0;
            }
        }, MAX_AUDIO_LENGTH * 1000);
    }
}());

async function getAudioStream(audioTrackConstraints) {
    let options = audioTrackConstraints || {};
    try {
        return await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
                sampleRate: options.sampleRate || WHISPER_SAMPLING_RATE,
                sampleSize: options.sampleSize || 16,
                channelCount: options.channelCount || 1
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Función para procesar audio solo si el modelo está listo
function processAudio() {
    if (isWorkerReady) {
        if (timeDataQueue.length >= MAX_SAMPLES) {
            const audioData = new Float32Array(timeDataQueue.splice(0, MAX_SAMPLES));
            try {
                worker.postMessage({ type: 'generate', data: { audio: audioData, language } });
            } catch (error) {
                console.error("Error sending message to worker:", error);
            }
        }
    }

    
}

// Escuchar el evento de cambio de idioma
window.addEventListener('languageChange', (e) => {
    const selectedLanguage = e.detail.language;
    language = selectedLanguage; // Actualiza la variable de idioma
    console.log(`Idioma actualizado en transcript.js: ${language}`);

    // Enviar el idioma al Worker
    worker.postMessage({ type: 'languageChange', data: { language: selectedLanguage } });
});

// Web Worker setup
const worker = new Worker('static/js/whisper.worker.js', { type: "module" });
let firstTime = true;

worker.onmessage = function (e) {
    switch (e.data.status) {
        case 'loading':
            console.log('Loading model...');
            break;

        case 'ready':
            console.log('Worker is ready for processing.');
            isWorkerReady = true; // Marcar el modelo como listo
            break;

        case 'complete':
            // Actualiza el DOM si es necesario
            if (firstTime) {
                outputMessageEl.innerHTML = e.data.innerhtml;
                firstTime = false;
            } else {
                outputMessageEl.innerHTML += e.data.innerhtml;
            }

            // Desplazar automáticamente hacia abajo
            outputMessageEl.scrollTop = outputMessageEl.scrollHeight;
            break;

        default:
            console.error('Unknown worker status:', e.data.status);
    }
};


worker.onerror = function (error) {
    console.error('Worker error:', error.message);
};

// Initialize worker
worker.postMessage({ type: 'load' });

//Adapted from https://github.com/xenova/whisper-web/tree/main/src


import {
    AutoTokenizer,
    AutoProcessor,
    WhisperForConditionalGeneration,
    TextStreamer,
    full,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.1.0";


const MAX_NEW_TOKENS = 64;

/**
 * This class uses the Singleton pattern to ensure that only one instance of the model is loaded.
 */
class AutomaticSpeechRecognitionPipeline {
    static model_id = null;
    static tokenizer = null;
    static processor = null;
    static model = null;

    static async getInstance() {
        this.model_id = 'onnx-community/whisper-base';

        this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id);
        this.processor ??= AutoProcessor.from_pretrained(this.model_id);

        this.model ??= WhisperForConditionalGeneration.from_pretrained(this.model_id, {
            dtype: {
                encoder_model: 'fp32', // 'fp16' works too
                decoder_model_merged: 'q4', // or 'fp32' ('fp16' is broken)
            },
            device: 'webgpu',
        });

        return Promise.all([this.tokenizer, this.processor, this.model]);
    }
}

let processing = false;
let musica = false;
let blank = false;
async function generate({ audio, language }) {
    if (processing) return;
    processing = true;

    // Tell the main thread we are starting
    //self.postMessage({ status: 'start' });

    // Retrieve the text-generation pipeline.
    const [tokenizer, processor, model] = await AutomaticSpeechRecognitionPipeline.getInstance();


    const streamer = new TextStreamer(tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
    });

    const inputs = await processor(audio);

    const outputs = await model.generate({
        ...inputs,
        max_new_tokens: MAX_NEW_TOKENS,
        language,
        streamer,
    });

    // Decode the output and format it
    let outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: true }).join(""); 
    let formattedText; // = outputText.replace(/\[Música\]/g, "<br>"); // Reemplaza [Música] por un salto de línea     
    

    if (language === "es") {
        if (outputText == " [Música]" && musica) {
            formattedText = " ";
        } else if (outputText == " [Música]") {
            formattedText = outputText.replace(/\[Música\]/g, "<br>");
            musica = true;
        } else {
            formattedText = outputText;
            musica = false;
        }
    } else if (language === "en") {
        if (outputText == " [BLANK_AUDIO]" && blank) {
            formattedText = " ";
        } else if (outputText == " [BLANK_AUDIO]") {
            formattedText = outputText.replace(/\[BLANK_AUDIO\]/g, "<br>");
            blank = true;
        } else {
            formattedText = outputText;
            blank = false;
        }
    } else {
        formattedText = outputText; // Otros idiomas no procesan la lógica especial
    }
    
    



    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: formattedText,
        innerhtml: formattedText,
    });
    processing = false;
}

async function load() {
    console.log('Loading model...');
    self.postMessage({
        status: 'loading',
        data: 'Loading model...'
    });

    // Load the pipeline and save it for future use.
    const [tokenizer, processor, model] = await AutomaticSpeechRecognitionPipeline.getInstance();

    self.postMessage({
        status: 'loading',
        data: 'Compiling shaders and warming up model...'
    });

    // Run model with dummy input to compile shaders
    await model.generate({
        input_features: full([1, 80, 3000], 0.0),
        max_new_tokens: 1,
        language: "es",
    });
    self.postMessage({ status: 'ready' });
}
// Listen for messages from the main thread
let currentLanguage = 'es'; // Idioma predeterminado

// Escuchar mensajes desde el hilo principal
self.addEventListener('message', async (e) => {
    const { type, data } = e.data;

    switch (type) {
        case 'load':
            load();
            break;

        case 'languageChange':
            currentLanguage = data.language; // Actualizar el idioma
            console.log(`Idioma actualizado en el Worker: ${currentLanguage}`);
            break;

        case 'generate':
            generate({ ...data, language: currentLanguage }); // Usa el idioma actual en la generación
            break;
    }
});

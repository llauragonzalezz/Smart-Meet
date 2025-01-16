function clearAllAnnotations() {
    // Seleccionar y eliminar todas las anotaciones (highlighter y text)
    const annotations = document.querySelectorAll('.highlighter-coco, .text-coco, .highlighter-yolo, .text-yolo');
    annotations.forEach(annotation => annotation.remove());
    console.log(`Se eliminaron ${annotations.length} anotaciones.`);
}


// Variables globales
let participants = 0;
let objects = [];



// Función para manejar la selección del modelo
async function handleModelSelection(selectedModel) {
    console.log("Selected Model: ", selectedModel);

    // Limpiar todas las anotaciones antes de cambiar de modelo
    clearAllAnnotations();

    // Reiniciar variables globales
    participants = 0;
    objects.length = 0; // Reinicia la lista de objetos

    try {
        switch (selectedModel) {
            case 'model1': // COCO-SSD
                console.log('Cargando script para COCO-SSD...');
                const { initCocoApp } = await import('./coco.js');
                clearAllAnnotations();
                await initCocoApp();
                clearAllAnnotations();
                break;

            case 'model2': // YOLO
                console.log('Cargando script para YOLO...');
                const { initYoloApp } = await import('./yolo.js');
                clearAllAnnotations();
                await initYoloApp();
                clearAllAnnotations();
                break;

            default:
                console.error('Modelo no reconocido.');
        }
    } catch (error) {
        console.error(`Error al cargar el script para ${selectedModel}:`, error);
    }
}






// Listener para el cambio de modelo
document.getElementById('model-select').addEventListener('change', async (event) => {
    const selectedModel = event.target.value;
    await handleModelSelection(selectedModel);
});

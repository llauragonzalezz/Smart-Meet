// Variable global para la transcripción
//let globalTranscript = ""; // Asegúrate de que esta variable sea actualizada por Whisper
let globalTranscript = document.querySelector('#transcript-text');

// Función para inicializar el drag and drop con detección de zonas
function initializeDragAndDropWithZones() {
    const zones = document.querySelectorAll('.priority-zone');
    const draggableItems = document.querySelectorAll('.idea-card');

    draggableItems.forEach(item => {
        item.addEventListener('dragstart', () => {
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    });

    zones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            if (dragging) {
                zone.querySelector('.drag-container').appendChild(dragging);

                // Cambiar el estilo de la tarjeta según la zona
                const priority = zone.getAttribute('data-priority');
                updateIdeaStyle(dragging, priority);
            }
        });
    });
}

// Función para cambiar el estilo de las tarjetas de idea según la prioridad
function updateIdeaStyle(ideaCard, priority) {
    ideaCard.classList.remove('high-priority', 'medium-priority', 'low-priority');

    if (priority === 'alta') {
        ideaCard.classList.add('high-priority');
    } else if (priority === 'media') {
        ideaCard.classList.add('medium-priority');
    } else if (priority === 'baja') {
        ideaCard.classList.add('low-priority');
    }
}

// Función para añadir ideas al timeline
function addToTimeline(idea, timestamp) {
    const timelineContainer = document.getElementById('timeline-container');
    const timelineItem = document.createElement('div');
    timelineItem.classList.add('timeline-item');

    const formattedTime = new Date(timestamp).toLocaleTimeString();

    timelineItem.innerHTML = `
        <div class="timeline-time">${formattedTime}</div>
        <div class="timeline-content">
            <strong>${idea.name}:</strong> ${idea.text}
        </div>
    `;

    timelineContainer.appendChild(timelineItem);
}

// Función para enviar resultados al servidor
async function fetchResults() {
    let transcript = globalTranscript.innerText;
    console.log("Contenido de globalTranscript antes de enviar:", transcript); // Depuración

    const currentLanguage = document.documentElement.lang || 'es'; // Idioma actual (default: 'es')


    if (!transcript || transcript.trim() === "") {
        console.log("Transcripción vacía, no se envían solicitudes.");
        return false; // Indicar que no se generó contenido
    }

    try {
        console.log("Enviando transcripción al servidor...");

        // Solicitar resumen
        const summaryResponse = await fetch('http://localhost:8000/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: transcript, language: currentLanguage  }),
        });
        const summaryData = await summaryResponse.json();
        const summaryContent = JSON.parse(summaryData.summary).text;
        document.getElementById('summary-text').innerHTML = summaryContent || 'No se pudo generar el resumen.';

        // Solicitar palabras clave
        const keywordsResponse = await fetch('http://localhost:8000/generate-keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: transcript, language: currentLanguage }),
        });
        const keywordsData = await keywordsResponse.json();
        const keywordsContent = JSON.parse(keywordsData.keywords).keywords;
        console.log(keywordsContent);
        const keywordsContainer = document.getElementById('keywords-text');
        keywordsContainer.innerHTML = '';

        if (keywordsContent && Array.isArray(keywordsContent)) {
            keywordsContent.forEach(keyword => {
                const keywordElement = document.createElement('span');
                keywordElement.classList.add('keyword-tag');
                keywordElement.textContent = keyword.text;
                keywordsContainer.appendChild(keywordElement);
            });
        } else {
            keywordsContainer.textContent = 'No se pudieron generar las palabras clave.';
        }

        // Solicitar ideas
        const ideasResponse = await fetch('http://localhost:8000/generate-ideas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: keywordsContent, language: currentLanguage }),
        });
        const ideasData = await ideasResponse.json();
        const ideasContent = JSON.parse(ideasData.ideas).ideas;
        const ideasContainer = document.getElementById('ideas-text');
        ideasContainer.innerHTML = '';

        if (ideasContent && Array.isArray(ideasContent)) {
            ideasContent.forEach((idea, index) => {
                const ideaCard = document.createElement('div');
                ideaCard.classList.add('idea-card');
                ideaCard.id = `idea-${index}`;
                ideaCard.draggable = true;
                ideaCard.innerHTML = `<strong>${idea.name}:</strong> ${idea.text}`;
                ideasContainer.appendChild(ideaCard);

                addToTimeline(idea, Date.now());
            });
            initializeDragAndDropWithZones();
        } else {
            ideasContainer.textContent = 'No se pudieron generar las ideas.';
        }
        
        return true; // Indicar que se generó contenido

    } catch (error) {
        console.error('Error al obtener los resultados:', error);

        document.getElementById('summary-text').textContent = 'Error al generar el resumen.';
        document.getElementById('keywords-text').textContent = 'Error al generar las palabras clave.';
        document.getElementById('ideas-text').textContent = 'Error al generar las ideas.';
        return false; // Indicar que no se generó contenido
    }
}

function startAutoUpdate() {
    const statusElement = document.getElementById("update-status");
    let timeToNextUpdate = 30; // Inicializa con 30 segundos para la próxima generación
    let generationInProgress = false; // Bandera para rastrear si la generación está en progreso

    // Traducciones para distintos idiomas
    const translations = {
        es: {
            generatingContent: "Generando contenido...",
            emptyTranscription: "Transcripción vacía. Esperando contenido...",
            generatingError: "Error al generar contenido. Intentando de nuevo...",
            updateContent: "El contenido inteligente será generado en {seconds} segundos."
        },
        en: {
            generatingContent: "Generating content...",
            emptyTranscription: "Empty transcription. Waiting for content...",
            generatingError: "Error generating content. Trying again...",
            updateContent: "Smart content will be generated in {seconds} seconds."
        },
        it: {
            generatingContent: "Generazione del contenuto in corso...",
            emptyTranscription: "Trascrizione vuota. In attesa del contenuto...",
            generatingError: "Errore nella generazione del contenuto. Riprovo...",
            updateContent: "Il contenuto intelligente sarà generato tra {seconds} secondi."
        }
    };

    // Idioma actual (puedes inyectarlo desde el servidor o configurarlo dinámicamente)
    const currentLanguage = document.documentElement.lang || 'es'; // Default a 'es'

    function updateStatus(message) {
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    // Escuchar el evento de sincronización desde el otro script
    window.addEventListener('sync-timer', (event) => {
        const remainingTime = event.detail.remainingTime;

        // Sincroniza el tiempo de la próxima generación con el tiempo restante global
        if (!generationInProgress && timeToNextUpdate > remainingTime % 30) {
            timeToNextUpdate = remainingTime % 30;
        }

        // Ejecutar fetchResults cuando el tiempo para la generación llegue a 0
        if (timeToNextUpdate === 0 && !generationInProgress) {
            generationInProgress = true;
            updateStatus(translations[currentLanguage].generatingContent);
            fetchResults()
                .then((result) => {
                    if (!result) {
                        updateStatus(translations[currentLanguage].emptyTranscription);
                    }
                })
                .catch(() => {
                    updateStatus(translations[currentLanguage].generatingError);
                })
                .finally(() => {
                    // Reinicia el contador después de la generación
                    timeToNextUpdate = 30;
                    generationInProgress = false;
                });
        }
    });

    // Actualizar dinámicamente el mensaje cada segundo
    setInterval(() => {
        if (timeToNextUpdate > 0 && !generationInProgress) {
            timeToNextUpdate--;
            const messageTemplate = translations[currentLanguage]?.updateContent || translations.es.updateContent;
            const timeMessage = messageTemplate.replace('{seconds}', timeToNextUpdate);
            updateStatus(timeMessage);
        }
    }, 1000);
}



// Iniciar la actualización automática
startAutoUpdate();

document.addEventListener("DOMContentLoaded", function () {
    const currentLanguage = document.documentElement.lang || 'es'; // Idioma actual (default: 'es')
    const keywordsContainer = document.getElementById("keywords-text");
    const keywordDetails = document.getElementById("keyword-details");
    let previousLength = 0;

    // Configurar un observador para detectar cambios en el contenedor
    const observer = new MutationObserver(() => {
        const keywords = Array.from(keywordsContainer.children).map(el => el.textContent);
        const currentLength = keywords.length;

        if (currentLength !== previousLength) {
            console.log("Cambio detectado en la longitud de las keywords:", currentLength);
            previousLength = currentLength;

            let globalTranscript = document.querySelector('#transcript-text');
            let transcript = globalTranscript ? globalTranscript.innerText : '';

            console.log("Transcripción actual:", transcript);

            // Llamada al endpoint para obtener estadísticas
            fetch('http://localhost:8000/generate-keywords-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transcript: transcript,
                    language: currentLanguage,
                    keywords: keywords
                })
            })
                .then(response => response.json())
                .then(data => {
                    const keywordStats = JSON.parse(data.keyword_stats).keywords_stats;
                    initializeUI(keywordStats, currentLanguage);
                })
                .catch(error => {
                    console.error("Error al obtener las estadísticas de palabras clave:", error);
                });
        }
    });

    observer.observe(keywordsContainer, { childList: true });

    // Inicializar la UI con los datos obtenidos
    function initializeUI(keywordStats, currentLanguage) {
        // Limpiar eventos existentes
        Array.from(keywordsContainer.children).forEach(keywordElement => {
            const newElement = keywordElement.cloneNode(true);
            keywordElement.parentNode.replaceChild(newElement, keywordElement);
        });

        // Agregar nuevos eventos a las etiquetas dinámicas
        Array.from(keywordsContainer.children).forEach(keywordElement => {
            keywordElement.addEventListener("click", () => {
                const keywordText = keywordElement.textContent;
                const selectedKeyword = keywordStats.find(k => k.text === keywordText);
                if (selectedKeyword) {
                    displayDetails(selectedKeyword, currentLanguage);
                }
            });
        });
    }

    // Diccionario para traducciones
    const translations = {
        es: {
            apariciones: "Apariciones",
            importancia: "Importancia",
            positividad: "Positividad",
            neutralidad: "Neutralidad",
            negatividad: "Negatividad"
        },
        en: {
            apariciones: "Appearances",
            importancia: "Importance",
            positividad: "Positivity",
            neutralidad: "Neutrality",
            negatividad: "Negativity"
        },
        it: {
            apariciones: "Apparizioni",
            importancia: "Importanza",
            positividad: "Positività",
            neutralidad: "Neutralità",
            negatividad: "Negatività"
        }
    };

    // Mostrar detalles de la palabra clave seleccionada con traducción
    function displayDetails(keyword, lang = currentLanguage) {
        const t = translations[lang] || translations['es']; // Fallback a español si el idioma no es válido

        keywordDetails.innerHTML = `
            <div class="keyword-details-card">
                <h3>${keyword.text}</h3>
                <div class="detail-item">
                    <span><strong>${t.apariciones}:</strong> ${keyword.apariciones}</span>
                </div>
                <div class="detail-item">
                    <span><strong>${t.importancia}:</strong></span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${keyword.importancia};"></div>
                    </div>
                    <span>${keyword.importancia}</span>
                </div>
                <div class="detail-item">
                    <span><strong>${t.positividad}:</strong></span>
                    <div class="progress-bar-container">
                        <div class="progress-bar positive" style="width: ${keyword.positividad};"></div>
                    </div>
                    <span>${keyword.positividad}</span>
                </div>
                <div class="detail-item">
                    <span><strong>${t.neutralidad}:</strong></span>
                    <div class="progress-bar-container">
                        <div class="progress-bar neutral" style="width: ${keyword.neutralidad};"></div>
                    </div>
                    <span>${keyword.neutralidad}</span>
                </div>
                <div class="detail-item">
                    <span><strong>${t.negatividad}:</strong></span>
                    <div class="progress-bar-container">
                        <div class="progress-bar negative" style="width: ${keyword.negatividad};"></div>
                    </div>
                    <span>${keyword.negatividad}</span>
                </div>
            </div>
        `;
    }

});

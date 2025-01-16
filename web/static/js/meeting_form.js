// Obtener referencias a los sliders y elementos de texto
const durationSlider = document.getElementById('meeting-duration');
const participantsSlider = document.getElementById('participants');
const durationValue = document.getElementById('duration-value');
const participantsValue = document.getElementById('participants-value');

// Traducciones para distintos idiomas
const translations = {
    es: {
        minutes: "minutos",
        participants: "participantes"
    },
    en: {
        minutes: "minutes",
        participants: "participants"
    },
    it: {
        minutes: "minuti",
        participants: "partecipanti"
    }
};

// Idioma actual (puedes inyectarlo desde el servidor o configurarlo dinámicamente)
const currentLanguage = document.documentElement.lang || 'es'; // Default a 'es'

// Función para obtener la traducción de una palabra clave
function translate(key) {
    return translations[currentLanguage]?.[key] || translations.es[key];
}

// Actualizar el texto al mover el slider de duración
durationSlider.addEventListener('input', () => {
    const minutesLabel = translate('minutes');
    durationValue.textContent = `${durationSlider.value} ${minutesLabel}`;
});

// Actualizar el texto al mover el slider de participantes
participantsSlider.addEventListener('input', () => {
    const participantsLabel = translate('participants');
    participantsValue.textContent = `${participantsSlider.value} ${participantsLabel}`;
});

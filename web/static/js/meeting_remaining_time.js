document.addEventListener('DOMContentLoaded', () => {
    const meetingDuration = parseInt(document.getElementById('meeting-time').textContent);
    const remainingTimeElement = document.getElementById('remaining-time');

    let remainingTime = meetingDuration * 60; // Convertir a segundos

    // Traducciones para distintos idiomas
    const translations = {
        es: {
            timeRemaining: "Tiempo restante: {minutes} minutos {seconds} segundos",
            meetingEnded: "La reunión ha terminado."
        },
        en: {
            timeRemaining: "Time remaining: {minutes} minutes {seconds} seconds",
            meetingEnded: "The meeting has ended."
        },
        it: {
            timeRemaining: "Tempo rimanente: {minutes} minuti {seconds} secondi",
            meetingEnded: "La riunione è terminata."
        }
    };

    // Idioma actual (puedes inyectarlo desde el servidor o configurarlo dinámicamente)
    const currentLanguage = document.documentElement.lang || 'es'; // Default a 'es'

    function emitSyncEvent() {
        const event = new CustomEvent('sync-timer', { detail: { remainingTime } });
        window.dispatchEvent(event); // Emitir evento global
    }

    function updateRemainingTime() {
        if (remainingTime > 0) {
            remainingTime--;

            // Convertir segundos restantes a minutos y segundos
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;

            // Obtener el mensaje traducido
            const messageTemplate = translations[currentLanguage]?.timeRemaining || translations.es.timeRemaining;
            const timeMessage = messageTemplate
                .replace('{minutes}', minutes)
                .replace('{seconds}', seconds);

            // Actualizar el texto del tiempo restante
            remainingTimeElement.textContent = timeMessage;

            // Emitir el evento de sincronización
            emitSyncEvent();
        } else {
            // Cuando el tiempo se agote
            const endMessage = translations[currentLanguage]?.meetingEnded || translations.es.meetingEnded;
            remainingTimeElement.textContent = endMessage;

            clearInterval(timerInterval); // Detener el intervalo

            // Redirigir a la página anterior después de un breve retraso
            setTimeout(() => {
                if (window.history.length > 1) {
                    window.history.back(); // Volver a la página anterior
                } else {
                    window.location.href = '/index'; // URL de redirección predeterminada
                }
            }, 2000);
        }
    }

    // Actualizar el tiempo restante cada segundo
    const timerInterval = setInterval(updateRemainingTime, 1000);
});

function changeLanguage(selectedLanguage) {
    const flags = document.querySelectorAll('.flag');
    flags.forEach(flag => flag.classList.remove('active')); // Quita la clase activa de todas las banderas

    if (selectedLanguage === 'es') {
        document.getElementById('flag-es').classList.add('active'); // Activa la bandera de España
        document.querySelector('.transcription-title').firstChild.textContent = "Transcripción"; // Actualiza el texto a español
    } else if (selectedLanguage === 'en') {
        document.getElementById('flag-en').classList.add('active'); // Activa la bandera del Reino Unido
        document.querySelector('.transcription-title').firstChild.textContent = "Transcript"; // Actualiza el texto a inglés
    }

    // Cambiar el idioma global y notificar a otros módulos
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: selectedLanguage } }));
    console.log(`Idioma cambiado a: ${selectedLanguage}`);
}

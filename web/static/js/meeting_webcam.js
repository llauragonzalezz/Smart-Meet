// meeting_webcam.js
document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('webcam');

    // Verificar soporte para getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({ video: true }) // Solicitar acceso a la webcam
            .then((stream) => {
                videoElement.srcObject = stream; // Asignar flujo al elemento de video
            })
            .catch((error) => {
                console.error('Error al acceder a la webcam:', error);
                videoElement.insertAdjacentHTML(
                    'afterend',
                    '<p>No se pudo acceder a la cámara. Por favor, verifica los permisos.</p>'
                );
            });
    } else {
        console.error('La API getUserMedia no está soportada en este navegador.');
        videoElement.insertAdjacentHTML(
            'afterend',
            '<p>Tu navegador no soporta el acceso a la cámara.</p>'
        );
    }
});
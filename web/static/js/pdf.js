// Diccionario para traducciones
const translations = {
    es: {
        title: "Transcripción inteligente de la reunión",
        meetingInfo: "Información de la Reunión",
        index: "Índice",
        summary: "1. Resumen",
        timeline: "2. Línea de Tiempo",
        fullTranscript: "3. Transcripción Completa",
        noSummary: "No hay resumen disponible.",
        noTimeline: "No hay eventos en la línea de tiempo.",
        idea: "Idea",
        duration: "Duración",
        participants: "Participantes"
    },
    en: {
        title: "Smart Meeting Transcription",
        meetingInfo: "Meeting Information",
        index: "Index",
        summary: "1. Summary",
        timeline: "2. Timeline",
        fullTranscript: "3. Full Transcript",
        noSummary: "No summary available.",
        noTimeline: "No events in the timeline.",
        idea: "Idea",
        duration: "Duration",
        participants: "Participants"
    },
    it: {
        title: "Trascrizione intelligente della riunione",
        meetingInfo: "Informazioni sulla Riunione",
        index: "Indice",
        summary: "1. Riepilogo",
        timeline: "2. Cronologia",
        fullTranscript: "3. Trascrizione Completa",
        noSummary: "Nessun riepilogo disponibile.",
        noTimeline: "Nessun evento nella cronologia.",
        idea: "Idea",
        duration: "Durata",
        participants: "Partecipanti"
    }
};

// Función para generar el PDF
function generatePDF(transcript, summary, timeline, meetingInfo, lang) {
    const { jsPDF } = window.jspdf; // Asegúrate de tener jsPDF disponible
    const pdf = new jsPDF();

    const t = translations[lang] || translations['es']; // Fallback a español si el idioma no es válido
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;

    // 1. Portada
    const logoImage = "static/imgs/light_logo_horizontal.png";
    const logoWidth = 100;
    const logoHeight = 60;
    const centerX = (pageWidth - logoWidth) / 2;
    const logoY = pageHeight / 2 - logoHeight;

    pdf.addImage(logoImage, "PNG", centerX, logoY, logoWidth, logoHeight);
    pdf.setFontSize(16);
    pdf.text(t.title, pageWidth / 2, logoY + logoHeight + 10, { align: "center" });

    // 2. Información de la reunión
    pdf.addPage();
    pdf.addImage(logoImage, "PNG", margin, margin, 50, 30);
    pdf.setFontSize(14);
    pdf.text(t.meetingInfo, margin, margin + 40);
    pdf.setFontSize(12);
    pdf.text(`${t.duration}: ${meetingInfo.duration}`, margin, margin + 50);
    pdf.text(`${t.participants}: ${meetingInfo.participants}`, margin, margin + 60);
    pdf.text(`${meetingInfo.remainingTime}`, margin, margin + 70);

    // 3. Índice
    pdf.addPage();
    pdf.addImage(logoImage, "PNG", margin, margin, 50, 30);
    pdf.setFontSize(14);
    pdf.text(t.index, margin, margin + 40);
    pdf.setFontSize(12);
    pdf.text(t.summary, margin, margin + 50);
    pdf.text(t.timeline, margin, margin + 60);
    pdf.text(t.fullTranscript, margin, margin + 70);

    // 4. Resumen
    pdf.addPage();
    pdf.addImage(logoImage, "PNG", margin, margin, 50, 30);
    pdf.setFontSize(14);
    pdf.text(t.summary, margin, margin + 40);
    pdf.setFontSize(12);
    const summaryLines = pdf.splitTextToSize(summary || t.noSummary, maxWidth);
    let cursorY = margin + 50;
    summaryLines.forEach((line) => {
        if (cursorY > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
        }
        pdf.text(line, margin, cursorY);
        cursorY += 10;
    });

    // 5. Línea de Tiempo
    pdf.addPage();
    pdf.addImage(logoImage, "PNG", margin, margin, 50, 30);
    pdf.setFontSize(14);
    pdf.text(t.timeline, margin, margin + 40);
    cursorY = margin + 50;

    if (timeline && timeline.length > 0) {
        timeline.forEach((event, index) => {
            const timelineText = `${t.idea} ${index + 1}. [${event.time}] ${event.content}`;
            const timelineLines = pdf.splitTextToSize(timelineText, maxWidth);

            timelineLines.forEach((line) => {
                if (cursorY > pageHeight - margin) {
                    pdf.addPage();
                    cursorY = margin;
                }
                pdf.text(line, margin, cursorY);
                cursorY += 10;
            });
            cursorY += 5;
        });
    } else {
        pdf.text(t.noTimeline, margin, cursorY);
    }

    // 6. Transcripción Completa
    pdf.addPage();
    pdf.addImage(logoImage, "PNG", margin, margin, 50, 30);
    pdf.setFontSize(14);
    pdf.text(t.fullTranscript, margin, margin + 40);
    pdf.setFontSize(12);
    const transcriptLines = pdf.splitTextToSize(transcript, maxWidth);
    cursorY = margin + 50;
    transcriptLines.forEach((line) => {
        if (cursorY > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
        }
        pdf.text(line, margin, cursorY);
        cursorY += 10;
    });

    pdf.save("transcripcion_reunion.pdf");
}

document.getElementById("download-pdf").addEventListener("click", () => {
    const currentLanguage = document.documentElement.lang || 'es'; // Idioma actual (default: 'es')

    const globalTranscript = document.querySelector('#transcript-text');
    let transcript = globalTranscript.innerText;
    const summary = document.getElementById("summary-text").textContent;

    // Capturar el timeline
    const timeline = Array.from(document.querySelectorAll(".timeline-item")).map((item) => ({
        time: item.querySelector(".timeline-time").textContent,
        content: item.querySelector(".timeline-content").textContent,
    }));

    // Capturar meetingInfo desde el DOM
    const meetingInfo = {
        title: document.getElementById("meeting-title").textContent,
        duration: document.getElementById("meeting-time").textContent,
        participants: document.getElementById("meeting-participants").textContent,
        remainingTime: document.getElementById("remaining-time").textContent,
    };

    console.log("Información de la reunión:", meetingInfo); // Depuración

    generatePDF(transcript, summary, timeline, meetingInfo, currentLanguage);
});

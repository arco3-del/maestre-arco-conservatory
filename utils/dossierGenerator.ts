import { getTranslator } from '../i18n';

declare const jspdf: any;

export const generateAndDownloadDossier = (language: 'en' | 'es') => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const t = getTranslator(language);

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
        const lines = doc.splitTextToSize(text.replace(/<.*?>/g, ''), maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * lineHeight);
    };

    // --- Page 1: Cover ---
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('Dossier Técnico: Conservatorio Maestre Arco', 105, 80, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('times', 'normal');
    doc.text('Sumisión Oficial para el Desafío "Construye con IA en Chrome"', 105, 90, { align: 'center' });
    doc.text('Autor: Richard Felipe Urbina, Director y Fundador', 105, 150, { align: 'center' });
    doc.text('Octubre de 2025', 105, 160, { align: 'center' });

    // --- Page 2: Manifesto ---
    doc.addPage();
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text(t('projectManifestoTitle'), 105, 20, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    addWrappedText(t('projectManifestoBody'), 20, 40, 170, 7);

    // --- Page 3: Inaugural Address ---
    doc.addPage();
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text(t('inauguralAddressTitle'), 105, 20, { align: 'center' });
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    addWrappedText(`"${t('inauguralAddressBody')}"`, 20, 40, 170, 7);

    // --- Page 4: Architecture ---
    doc.addPage();
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text('Arquitectura de la Aplicación', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    
    let y = 40;
    doc.setFont('helvetica', 'bold');
    doc.text('Diagrama Conceptual:', 20, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('- Cliente (Navegador): React (UI), index.html (PWA)', 25, y); y += 7;
    doc.text('- Servicios de IA: Conexión directa a la API de Gemini (Cloud)', 25, y); y += 7;
    doc.text('- IA en Dispositivo: Extensión generada con Chrome AI API (window.ai)', 25, y); y += 15;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción:', 20, y); y += 7;
    doc.setFont('helvetica', 'normal');
    y = addWrappedText('Maestre Arco opera bajo una arquitectura PWA (Progressive Web App) basada en React, garantizando acceso universal. La lógica de negocio está encapsulada en servicios que interactúan directamente con la API de Gemini, permitiendo una separación clara de responsabilidades. La gestión de estado global y el enrutamiento se manejan en el componente raíz App.tsx, funcionando como una máquina de estados finitos.', 20, y, 170, 7);

    // --- Pages 5-7: Briefing ---
    const briefingContent = [
        { title: t('directorOfficeFunction'), tech: t('directorOfficeTech'), impact: t('directorOfficeImpact') },
        { title: t('studyPlanFunction'), tech: t('studyPlanTech'), impact: t('studyPlanImpact') },
        { title: t('studyRoomFunction'), tech: t('studyRoomTech'), impact: t('studyRoomImpact') },
        { title: t('liveClassroomFunction'), tech: t('liveClassroomTech'), impact: t('liveClassroomImpact') },
        { title: t('knowledgeHallFunction'), tech: t('knowledgeHallTech'), impact: t('knowledgeHallImpact') },
        { title: t('pianoHallFunction'), tech: t('pianoHallTech'), impact: t('pianoHallImpact') },
        { title: t('scriptoriumFunction'), tech: t('scriptoriumTech'), impact: t('scriptoriumImpact') },
        { title: t('visionAtelierFunction'), tech: t('visionAtelierTech'), impact: t('visionAtelierImpact') },
        { title: t('chromeLabFunction'), tech: t('chromeLabTech'), impact: t('chromeLabImpact') },
        { title: t('musicBookFunction'), tech: t('musicBookTech'), impact: t('musicBookImpact') },
        { title: t('voiceHallFunction'), tech: t('voiceHallTech'), impact: t('voiceHallImpact') },
    ];
    
    doc.addPage();
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text('Desglose Funcional y de Impacto Real', 105, 20, { align: 'center' });
    y = 35;
    briefingContent.forEach(item => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        y = addWrappedText(item.title, 20, y, 170, 6);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); y += 1;
        y = addWrappedText(item.tech, 25, y, 165, 6); y += 1;
        y = addWrappedText(item.impact, 25, y, 165, 6); y += 10;
    });

    // --- Page 8: Stack ---
    doc.addPage();
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text('Stack Tecnológico y Conclusión', 105, 20, { align: 'center' });
    y = 40;

    const stack = {
        'Frontend': 'React 19, TypeScript, Tailwind CSS',
        'APIs de IA (Google)': 'Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini Live API, Imagen 4.0, Gemini Flash Image, Gemini TTS, Grounding API.',
        'APIs de Navegador': 'Web Audio API, MediaRecorder, Geolocation, SpeechRecognition, AudioWorklet.',
        'IA en Dispositivo': 'Chrome AI API (window.ai).',
        'Librerías Adicionales': 'jsPDF, JSZip, qrcode.js, html5-qrcode.'
    };
    doc.setFontSize(12);
    Object.entries(stack).forEach(([key, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(key + ':', 20, y);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(value, 65, y, 125, 7);
        y += 5;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Conclusión:', 20, y); y += 7;
    doc.setFont('helvetica', 'normal');
    addWrappedText('Maestre Arco es una demostración exhaustiva y pulida del futuro de la web inteligente. No es solo una aplicación, sino un ecosistema educativo completo, un testimonio del poder de la IA para democratizar el conocimiento y una prueba irrefutable del potencial de las APIs de Google para construir experiencias significativas y con un impacto real.', 20, y, 170, 7);

    doc.save('Maestre_Arco_Dossier_Final_777.pdf');
};

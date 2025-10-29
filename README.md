# Maestre Arco: AI Music Conservatory

**Maestre Arco** is a revolutionary Progressive Web App (PWA) that redefines music education by providing a personal AI mentor. It leverages the full suite of Google's Gemini AI models to create an immersive, personalized, and universally accessible digital music conservatory.

This project was developed as a submission for the **"Build with AI on Chrome" Challenge**.

---

## Vision & Manifesto

We believe high-quality music education is a right, not a privilege. Maestre Arco eliminates economic and geographical barriers, offering world-class training to anyone with a browser. Our core principle is **Human-AI Synergy**: AI is not a substitute for the human spirit, but its most powerful amplifier. Maestre Arco acts as a mentor, a tool, and a catalyst, allowing students to focus on what is intrinsically human: emotion, interpretation, and creation.

---

## The Conservatory Halls: Features & Status

Each feature of the conservatory is presented as a "Hall," a dedicated space for a specific aspect of musical learning.

| Sala (Hall)                               | Estado (Status) | Descripción (Description)                                                                                                                              | Tecnología Principal (Core Technology)                               |
| ------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Plan de Estudios Personalizado**         | ✅ **Activo**     | Generates a complete 10-module curriculum based on the student's instrument, from beginner to virtuoso.                                                | `gemini-2.5-flash` + JSON Schema                                     |
| **Sala de Estudio**                        | ✅ **Activo**     | Students record a video of their performance, and the AI provides detailed feedback on technique, tone, rhythm, and posture.                           | Multimodal `gemini-2.5-pro` (Video + Audio)                          |
| **Aula Magna (Clase en Vivo)**             | ✅ **Activo**     | A real-time, low-latency audio final evaluation with Maestre Arco, simulating a live masterclass or audition.                                          | `gemini-2.5-flash-native-audio-preview-09-2025` (Live API)           |
| **Salón del Conocimiento**                 | ✅ **Activo**     | An infinite library where students can ask any question about music theory, history, or composers, with verified answers.                                | `gemini-2.5-flash` + Google Search Grounding                         |
| **Salón del Piano Astral**                 | ✅ **Activo**     | A creative workshop with an interactive piano, an AI Composer for lyrics and chords, and an Orchestration Panel.                                       | `gemini-2.5-pro` (Composition), Web Audio API                        |
| **Scriptorium**                            | ✅ **Activo**     | A theoretical study space where the AI generates complete lessons and personalized exercises on demand for any topic.                                    | `gemini-2.5-pro` + JSON Schema                                     |
| **Atelier de la Visión**                   | ✅ **Activo**     | A visual arts studio to generate album art, analyze sheet music from a photo, or edit images with text prompts.                                        | `imagen-4.0-generate-001`, `gemini-2.5-flash-image`, Multimodal `gemini-2.5-pro` |
| **Salón de la Voz**                        | ✅ **Activo**     | A specialized studio for vocalists with guided warm-ups, real-time pitch analysis, and repertoire practice feedback.                                   | `gemini-2.5-pro` (Multimodal), TTS, Web Audio API                    |
| **Laboratorio de Extensiones de Chrome**   | ✅ **Activo**     | A meta-feature that generates the complete code for a functional Chrome Extension using the on-device Gemini Nano model.                               | Code Generation, Chrome AI API (`window.ai`)                         |
| **Music Book (Red Social)**                | ✅ **Activo**     | The social hub of the conservatory for students to share progress, collaborate, and communicate.                                                       | State Management (React), `gemini-2.5-flash` (for simulated chat)    |
| **Oficina del Director**                   | ✅ **Activo**     | The command center for project stakeholders, providing access to high-level documentation and presentation tools.                                        | State Management (React)                                             |
| **Bóveda de Ideas Futuras**                | ✅ **Activo**     | A view for the director to see potential future features and the project's roadmap, as requested by the user.                                          | Static UI Component                                                  |

---

## Technology Stack

-   **Frontend:** React 19, TypeScript, Tailwind CSS
-   **AI (Google):** Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini Live API, Imagen 4.0, Gemini Flash Image, Gemini TTS, Grounding API.
-   **On-Device AI:** Chrome AI API (`window.ai`)
-   **Browser APIs:** Web Audio API, MediaRecorder, Geolocation, SpeechRecognition, AudioWorklet.
-   **Tooling:** Vite, JSPDF, JSZip, QRCode.js

---

## Getting Started

### Prerequisites

-   A modern web browser that supports the PWA feature set (e.g., Google Chrome).
-   A Google Gemini API Key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **API Key Configuration:**
    The application is designed to pull the API key directly from the execution environment. You must have `process.env.API_KEY` configured for the app to function. For local development, you would typically use a `.env` file or set the environment variable in your terminal.

    *Create a `.env` file in the root of the project:*
    ```
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

3.  **Run the application:**
    As this is a Vite-based project, you would typically run:
    ```bash
    npm install
    npm run dev
    ```

    Open your browser to the local address provided by Vite.

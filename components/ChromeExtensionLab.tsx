
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

declare const JSZip: any;

interface ChromeExtensionLabProps {
    onLeave: () => void;
}

type GeneratedFiles = { [key: string]: string };

const CodeBlock: React.FC<{ title: string; code: string }> = ({ title, code }) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex justify-between items-center bg-gray-900 px-4 py-2 rounded-t-md">
                <h4 className="font-mono text-sm text-yellow-300">{title}</h4>
                <button onClick={handleCopy} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md transition-colors">
                    {copied ? t('codeCopied') : t('copyCodeButton')}
                </button>
            </div>
            <pre className="bg-gray-800 text-white p-4 rounded-b-md overflow-x-auto text-xs max-h-60">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const ChromeExtensionLab: React.FC<ChromeExtensionLabProps> = ({ onLeave }) => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const generateExtensionFiles = (): GeneratedFiles => {
        const manifest = {
            "manifest_version": 3,
            "name": "Maestre Arco AI Toolkit (Gemini Nano)",
            "version": "1.0",
            "description": "An AI-powered toolkit in your browser's side panel.",
            "permissions": ["sidePanel"],
            "side_panel": {
                "default_path": "sidepanel.html"
            },
            "action": {
                "default_title": "Open Maestre Arco Toolkit"
            },
            "background": {
                "service_worker": "background.js"
            }
        };

        const background = `
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
        `;

        const readme = `
# Maestre Arco Companion Extension

## PC Installation (Unpacked)

1. Open Chrome and navigate to \`chrome://extensions\`.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked".
4. Select the directory containing these files.
5. The extension icon will appear. Click it to open the side panel!

## Mobile Installation (Kiwi Browser)

1. Download the .zip file to your device.
2. Open Kiwi Browser, go to the menu (three dots) and select "Extensions".
3. Enable "Developer mode".
4. Select "+ (from .zip/.crx/.user.js)".
5. Find and select the downloaded \`MaestreArcoExtension.zip\`.
6. The extension is now installed!
        `;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Maestre Arco Toolkit</title>
    <link rel="stylesheet" href="sidepanel.css">
</head>
<body>
    <header>
        <h1>Maestre Arco Toolkit</h1>
        <p>Powered by Gemini Nano</p>
    </header>
    <main>
        <div class="tabs">
            <button id="tutorTabBtn" class="active">AI Tutor</button>
            <button id="toolsTabBtn">AI Tools</button>
        </div>

        <!-- AI Tutor Panel -->
        <div id="tutorPanel" class="panel active">
            <div id="chat-container"></div>
            <div class="input-area">
                <input type="text" id="chat-input" placeholder="Ask the Maestre...">
                <button id="send-btn">Send</button>
            </div>
        </div>

        <!-- AI Tools Panel -->
        <div id="toolsPanel" class="panel">
            <div class="tool">
                <h3>Translate</h3>
                <textarea id="translate-input" placeholder="Text to translate..."></textarea>
                <select id="translate-lang">
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                </select>
                <button id="translate-btn">Translate</button>
            </div>
             <div class="tool">
                <h3>Summarize</h3>
                <textarea id="summarize-input" placeholder="Text to summarize..."></textarea>
                <button id="summarize-btn">Summarize</button>
            </div>
            <div class="result-box" id="tools-result"></div>
        </div>
    </main>
    <script src="sidepanel.js"></script>
</body>
</html>
        `;

        const css = `
body {
    font-family: sans-serif;
    background-color: #1a1a2e;
    color: #e0e0e0;
    margin: 0;
    padding: 16px;
    width: 300px;
}
header { text-align: center; margin-bottom: 16px; }
h1 { color: #f0c419; margin: 0; }
h3 { color: #9aedfb; border-bottom: 1px solid #9aedfb; padding-bottom: 4px;}
.tabs { display: flex; border-bottom: 1px solid #4a4e69; }
.tabs button { flex: 1; background: none; border: none; color: #c9c9c9; padding: 10px; cursor: pointer; border-bottom: 2px solid transparent; }
.tabs button.active { color: #f0c419; border-bottom-color: #f0c419; }
.panel { display: none; margin-top: 16px; }
.panel.active { display: block; }
#chat-container { height: 300px; overflow-y: auto; border: 1px solid #4a4e69; padding: 8px; border-radius: 4px; margin-bottom: 8px; display: flex; flex-direction: column; }
.message { margin-bottom: 8px; padding: 8px; border-radius: 8px; max-width: 80%; word-wrap: break-word; }
.user-message { background-color: #4a4e69; align-self: flex-end; }
.model-message { background-color: #2c2f48; align-self: flex-start; }
.input-area { display: flex; }
input, textarea, select { width: 100%; background: #2c2f48; border: 1px solid #4a4e69; color: #e0e0e0; padding: 8px; border-radius: 4px; box-sizing: border-box; }
button { background-color: #f0c419; color: #161625; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
button:hover { background-color: #ffde59; }
.tool { margin-bottom: 16px; }
.tool textarea { height: 60px; }
.tool select { margin: 8px 0; }
.result-box { margin-top: 12px; background: #2c2f48; padding: 8px; border-radius: 4px; min-height: 50px; white-space: pre-wrap; word-wrap: break-word; }
        `;

        const js = `
document.addEventListener('DOMContentLoaded', () => {
    const tutorTabBtn = document.getElementById('tutorTabBtn');
    const toolsTabBtn = document.getElementById('toolsTabBtn');
    const tutorPanel = document.getElementById('tutorPanel');
    const toolsPanel = document.getElementById('toolsPanel');

    tutorTabBtn.addEventListener('click', () => {
        tutorTabBtn.classList.add('active');
        toolsTabBtn.classList.remove('active');
        tutorPanel.classList.add('active');
        toolsPanel.classList.remove('active');
    });

    toolsTabBtn.addEventListener('click', () => {
        toolsTabBtn.classList.add('active');
        tutorTabBtn.classList.remove('active');
        toolsPanel.classList.add('active');
        tutorPanel.classList.remove('active');
    });

    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    let session;

    async function initTutor() {
        if (await window.ai.canCreateTextSession() === 'readily') {
            session = await window.ai.createTextSession();
            addMessage('Hello! I am your on-device AI assistant. How can I help?', 'model');
        } else {
            addMessage('On-device AI not available. Please check your Chrome version and settings.', 'model');
            sendBtn.disabled = true;
            chatInput.disabled = true;
        }
    }

    function addMessage(text, role) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role + '-message');
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function sendMessage() {
        const prompt = chatInput.value.trim();
        if (!prompt || !session) return;
        
        addMessage(prompt, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;
        
        const stream = session.promptStreaming(prompt);
        let fullResponse = '';
        
        const modelMessageDiv = document.createElement('div');
        modelMessageDiv.classList.add('message', 'model-message');
        chatContainer.appendChild(modelMessageDiv);

        for await (const chunk of stream) {
            fullResponse += chunk;
            modelMessageDiv.textContent = fullResponse;
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        sendBtn.disabled = false;
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());

    const translateBtn = document.getElementById('translate-btn');
    const summarizeBtn = document.getElementById('summarize-btn');
    const toolsResult = document.getElementById('tools-result');

    async function runTool(prompt) {
        if (await window.ai.canCreateTextSession() === 'readily') {
            toolsResult.textContent = 'Thinking...';
            try {
                const result = await window.ai.generateText({ prompt });
                toolsResult.textContent = result;
            } catch (e) {
                toolsResult.textContent = 'Error: ' + e.message;
            }
        } else {
            toolsResult.textContent = 'On-device AI not available.';
        }
    }

    translateBtn.addEventListener('click', () => {
        const text = document.getElementById('translate-input').value;
        const lang = document.getElementById('translate-lang').value;
        if (!text) return;
        runTool('Translate the following text to ' + lang + ': ' + text);
    });

    summarizeBtn.addEventListener('click', () => {
        const text = document.getElementById('summarize-input').value;
        if (!text) return;
        runTool('Summarize the following text: ' + text);
    });

    initTutor();
});
        `;
        return {
            "manifest.json": JSON.stringify(manifest, null, 2),
            "background.js": background,
            "README.md": readme,
            "sidepanel.html": html,
            "sidepanel.css": css,
            "sidepanel.js": js
        };
    };

    const handleGenerate = async (format: 'unpacked' | 'zip') => {
        setIsLoading(true);
        setGeneratedFiles(null);
        setToast(null);

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate generation

        const files = generateExtensionFiles();
        
        if (format === 'unpacked') {
            setGeneratedFiles(files);
        } else if (format === 'zip') {
            if (typeof JSZip === 'undefined') {
                setToast('Error: Could not load ZIP library.');
                setIsLoading(false);
                return;
            }
            const zip = new JSZip();
            for (const [filename, content] of Object.entries(files)) {
                zip.file(filename, content);
            }
            try {
                const blob = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'MaestreArcoExtension.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                setToast(t('zipDownloadSuccess'));
            } catch(e) {
                setToast('Error creating zip file.');
            }
        }
        setIsLoading(false);
    };

    const GenerationOption: React.FC<{ format: 'unpacked' | 'zip' }> = ({ format }) => {
        const isUnpacked = format === 'unpacked';
        const title = isUnpacked ? t('labOptionUnpacked_Title') : t('labOptionZip_Title');
        const description = isUnpacked ? t('labOptionUnpacked_Description') : t('labOptionZip_Description');
        const buttonText = isUnpacked ? t('generateButtonUnpacked') : t('generateButtonZip');
        const borderColor = isUnpacked ? 'border-green-500/50' : 'border-purple-500/50';
        const buttonColor = isUnpacked ? 'bg-green-600 hover:bg-green-500' : 'bg-purple-600 hover:bg-purple-500';

        return (
            <div className={`bg-gray-800/50 p-6 rounded-lg border ${borderColor}`}>
                <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-300 mb-6 text-sm">{description}</p>
                <button
                    onClick={() => handleGenerate(format)}
                    className={`w-full px-6 py-3 font-bold rounded-lg text-white transition-all duration-300 transform hover:scale-105 ${buttonColor}`}
                >
                    {buttonText}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            {toast && (
                <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[2000] animate-fade-in-up">
                    {toast}
                </div>
            )}
            <div className="max-w-4xl mx-auto">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-6">
                    &larr; {t('backToDashboardButton')}
                </button>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('labTitle')}</h1>
                    <p className="text-lg text-cyan-300 mt-2">{t('labSubtitle')}</p>
                </div>

                <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GenerationOption format="unpacked" />
                    <GenerationOption format="zip" />
                </div>

                {isLoading && <LoadingSpinner message={t('generatingExtension')} />}
                
                {generatedFiles && (
                    <div className="mt-10 animate-fade-in-up">
                        <div className="text-center mb-6">
                           <h2 className="text-3xl font-bold text-white">
                                {t('generatedFilesTitlePC')}
                            </h2>
                            <p className="text-gray-400 mt-1">{t('generatedFilesSubtitle')}</p>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(generatedFiles).map(([filename, code]) => (
                                <CodeBlock key={filename} title={filename} code={code} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChromeExtensionLab;
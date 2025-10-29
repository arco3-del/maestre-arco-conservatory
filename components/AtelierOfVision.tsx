import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { generateImage, analyzeUploadedImage, editImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface AtelierOfVisionProps {
    onLeave: () => void;
}

type Tab = 'generate' | 'analyze' | 'edit';

const AtelierOfVision: React.FC<AtelierOfVisionProps> = ({ onLeave }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('generate');

    const TabButton: React.FC<{ tab: Tab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm md:text-base font-bold rounded-t-lg transition-colors border-b-4 ${activeTab === tab ? 'bg-gray-700/80 border-blue-400 text-white' : 'bg-gray-800/50 border-transparent text-gray-400 hover:bg-gray-700/50'}`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'generate': return <GenerateImagePanel />;
            case 'analyze': return <AnalyzeImagePanel />;
            case 'edit': return <EditImagePanel />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-4">
                    &larr; {t('backToDashboardButton')}
                </button>
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('atelierTitle')}</h1>
                    <p className="text-lg text-blue-300 mt-2">{t('atelierSubtitle')}</p>
                </div>

                <div className="flex space-x-2 border-b border-gray-700">
                    <TabButton tab="generate" label={t('generateTab')} />
                    <TabButton tab="analyze" label={t('analyzeTab')} />
                    <TabButton tab="edit" label={t('editTab')} />
                </div>

                <div className="mt-1 bg-black/40 backdrop-blur-md p-4 sm:p-6 rounded-b-lg border border-t-0 border-gray-700">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// --- Panel de Generación de Imágenes ---
const GenerateImagePanel: React.FC = () => {
    const { t } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedImage, setGeneratedImage] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        setGeneratedImage('');
        try {
            const imageUrl = await generateImage(prompt, aspectRatio);
            setGeneratedImage(imageUrl);
        } catch (err) {
            console.error(err);
            setError(t('imageGenerationError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{t('generateImageTitle')}</h2>
            <p className="text-gray-400 mb-6">{t('generateImageSubtitle')}</p>
            <div className="space-y-4 max-w-lg mx-auto">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('promptPlaceholder')}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-blue-500"
                    rows={3}
                    disabled={isLoading}
                />
                <div className="flex items-center justify-center gap-4">
                    <label htmlFor="aspect-ratio" className="text-sm font-medium text-yellow-400">{t('aspectRatioLabel')}</label>
                    <select
                        id="aspect-ratio"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-blue-500"
                        disabled={isLoading}
                    >
                        <option value="1:1">1:1</option>
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="4:3">4:3</option>
                        <option value="3:4">3:4</option>
                    </select>
                </div>
                <button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-500">
                    {t('generateButton')}
                </button>
            </div>
            {isLoading && <div className="mt-8"><LoadingSpinner message={t('generatingImage')} /></div>}
            {error && <p className="text-red-400 mt-4">{error}</p>}
            {generatedImage && (
                <div className="mt-8">
                    <img src={generatedImage} alt="Generated art" className="max-w-full mx-auto rounded-lg shadow-lg" />
                </div>
            )}
        </div>
    );
};

// --- Paneles de Análisis y Edición (con manejo de archivos) ---
const ImageToolPanel: React.FC<{
    titleKey: string,
    subtitleKey: string,
    promptPlaceholderKey: string,
    buttonKey: string,
    loadingKey: string,
    errorKey: string,
    onAction: (file: File, prompt: string) => Promise<string>,
    isResultImage: boolean
}> = ({ titleKey, subtitleKey, promptPlaceholderKey, buttonKey, loadingKey, errorKey, onAction, isResultImage }) => {
    const { t } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult('');
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        }
    };
    
    const handleAction = async () => {
        if (!file || !prompt) return;
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const actionResult = await onAction(file, prompt);
            setResult(actionResult);
        } catch(err) {
            console.error(err);
            setError(t(errorKey));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{t(titleKey)}</h2>
            <p className="text-gray-400 mb-6">{t(subtitleKey)}</p>
            
            <div className="space-y-4 max-w-lg mx-auto">
                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
                    {t('uploadImageButton')}
                </button>
                
                {preview && <img src={preview} alt="Preview" className="max-w-xs mx-auto rounded-lg" />}

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t(promptPlaceholderKey)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-blue-500"
                    rows={2}
                    disabled={isLoading || !file}
                />
                <button onClick={handleAction} disabled={isLoading || !file || !prompt} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-500">
                    {t(buttonKey)}
                </button>
            </div>
            {isLoading && <div className="mt-8"><LoadingSpinner message={t(loadingKey)} /></div>}
            {error && <p className="text-red-400 mt-4">{error}</p>}
            {result && (
                <div className="mt-8">
                    {isResultImage ? (
                        <img src={result} alt="Result" className="max-w-full mx-auto rounded-lg shadow-lg" />
                    ) : (
                        <p className="p-4 bg-gray-800/50 rounded-lg text-left whitespace-pre-wrap">{result}</p>
                    )}
                </div>
            )}
        </div>
    );
};

const AnalyzeImagePanel = () => (
    <ImageToolPanel
        titleKey="analyzeImageTitle"
        subtitleKey="analyzeImageSubtitle"
        promptPlaceholderKey="questionPlaceholder"
        buttonKey="analyzeButton"
        loadingKey="analyzingImage"
        errorKey="imageAnalysisError"
        onAction={(file, prompt) => analyzeUploadedImage(file, prompt)}
        isResultImage={false}
    />
);

const EditImagePanel = () => (
    <ImageToolPanel
        titleKey="editImageTitle"
        subtitleKey="editImageSubtitle"
        promptPlaceholderKey="editPlaceholder"
        buttonKey="editButton"
        loadingKey="editingImage"
        errorKey="imageEditingError"
        onAction={(file, prompt) => editImage(file, prompt)}
        isResultImage={true}
    />
);

export default AtelierOfVision;
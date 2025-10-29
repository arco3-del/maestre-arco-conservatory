import React from 'react';
import TextToSpeechButton from './TextToSpeechButton';

interface LoadingSpinnerProps {
    message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <div className="w-16 h-16 mb-6 animate-pulse">
                <svg viewBox="0 0 100 100" fill="#AE955D" xmlns="http://www.w3.org/2000/svg">
                    <style>
                        {`.heavy { font: bold 60px 'Cormorant Garamond', serif; } .light { font: 50px 'Cormorant Garamond', serif; }`}
                    </style>
                    <text x="18" y="70" className="heavy">M</text>
                    <text x="50" y="70" className="light">A</text>
                </svg>
            </div>
            <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white">{message}</h3>
                <TextToSpeechButton textToSpeak={message} />
            </div>
            <p className="text-gray-400 mt-2">Un momento, por favor.</p>
        </div>
    );
};

export default LoadingSpinner;
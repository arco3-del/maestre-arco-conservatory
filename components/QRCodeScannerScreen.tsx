import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { JudgePassData, DirectorPassData } from '../types';
import { getJudgeById } from '../utils/judges';

declare const Html5QrcodeScanner: any;
declare const Html5Qrcode: any;

interface QRCodeScannerScreenProps {
  onJudgeScanSuccess: (data: JudgePassData) => void;
  onDirectorScanSuccess: (data: DirectorPassData) => void;
  onCancel: () => void;
}

const QRCodeScannerScreen: React.FC<QRCodeScannerScreenProps> = ({ onJudgeScanSuccess, onDirectorScanSuccess, onCancel }) => {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<any>(null);

  const handleScanResult = useCallback((decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      
      // Judge Pass
      if (data.type === 'MAESTRE_ARCO_JUDGE_PASS' && data.id) {
        const judge = getJudgeById(data.id);
        if (judge) {
          scannerRef.current?.clear();
          onJudgeScanSuccess(judge);
          return;
        }
      }

      // Director Pass
      if (data.type === 'MAESTRE_ARCO_DIRECTOR_PASS' && data.name) {
        scannerRef.current?.clear();
        onDirectorScanSuccess(data as DirectorPassData);
        return;
      }

      setError(t('invalidQrCodeError'));
    } catch (e) {
      setError(t('invalidQrCodeError'));
    }
  }, [onJudgeScanSuccess, onDirectorScanSuccess, t]);


  useEffect(() => {
    function handleScanFailure(error: any) {
      // This function is called frequently, so we don't set an error state here to avoid flickering.
    }
    
    // Check for camera permissions
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        scannerRef.current = scanner;
        scanner.render(handleScanResult, handleScanFailure);
      })
      .catch(err => {
        console.error("Camera permission denied:", err);
        setError(t('cameraError'));
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error: any) => {
          console.error("Failed to clear html5-qrcode-scanner.", error);
        });
      }
    };
  }, [handleScanResult, t]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.scanFile(file, true)
        .then(decodedText => {
            handleScanResult(decodedText);
        })
        .catch(err => {
            setError(t('invalidQrCodeError'));
        });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black p-4 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-4">{t('scanJudgePassTitle')}</h1>
        <p className="text-gray-300 mb-8 text-center">{t('scanJudgePassSubtitle')}</p>
        
        <div id="qr-reader" className="w-full max-w-sm bg-gray-800 rounded-lg overflow-hidden border-2 border-cyan-500"></div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 px-6 py-3 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-500 transition-colors"
        >
            {t('uploadQrCode')}
        </button>

        <button 
            onClick={onCancel}
            className="mt-4 px-8 py-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
            {t('cancelButton')}
        </button>
    </div>
  );
};

export default QRCodeScannerScreen;
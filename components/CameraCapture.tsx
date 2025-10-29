import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface CameraCaptureProps {
  onPhotoTaken: (dataUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoTaken }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    if (stream) return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(t('cameraError'));
    }
  }, [stream, t]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCamera]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    const x = (video.videoWidth - size) / 2;
    const y = (video.videoHeight - size) / 2;
    
    context.drawImage(video, x, y, size, size, 0, 0, size, size);
    
    const dataUrl = canvas.toDataURL('image/png');
    setPhotoDataUrl(dataUrl);
    onPhotoTaken(dataUrl);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPhotoDataUrl(dataUrl);
        onPhotoTaken(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setPhotoDataUrl(null);
    onPhotoTaken('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (error) {
    return <div className="aspect-square w-full bg-gray-800 rounded-full flex items-center justify-center text-center text-red-400 p-4">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        <canvas ref={canvasRef} className="hidden" />
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
        {photoDataUrl ? (
          <img src={photoDataUrl} alt="User" className="w-full h-full rounded-full object-cover border-4 border-cyan-400" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full rounded-full object-cover transform -scale-x-100"></video>
        )}
        <div className="absolute inset-0 rounded-full border-4 border-yellow-500/50 pointer-events-none"></div>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {photoDataUrl ? (
          <button type="button" onClick={retakePhoto} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">{t('retakePhoto')}</button>
        ) : (
          <>
            <button type="button" onClick={takePhoto} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors">{t('takePhoto')}</button>
            <button type="button" onClick={handleUploadClick} className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-500 transition-colors">{t('uploadFromGallery')}</button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
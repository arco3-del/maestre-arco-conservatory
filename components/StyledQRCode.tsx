import React, { useRef, useEffect, useState } from 'react';

// This component relies on the QRCode.js library being loaded globally from the CDN in index.html
declare const QRCode: any;

const MA_LOGO_URL = '/default-profile-icon.svg'; 

interface StyledQRCodeProps {
  data: string;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

const StyledQRCode: React.FC<StyledQRCodeProps> = ({
  data,
  size = 192,
  primaryColor = '#1a1a1a',
  secondaryColor = '#AE955D',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Preload the logo
  useEffect(() => {
    const img = new Image();
    img.src = MA_LOGO_URL;
    img.onload = () => {
        logoRef.current = img;
        setLogoLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!logoLoaded || !canvasRef.current || typeof QRCode === 'undefined') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use QRCode.js to get the data matrix, but don't render it
    const qr = new QRCode(document.createElement('div'), {
        text: data,
        width: size,
        height: size,
        correctLevel: QRCode.CorrectLevel.H,
    });

    // @ts-ignore: _oQRCode is an internal property but necessary here
    const moduleCount = qr._oQRCode.moduleCount;
    const moduleSize = size / moduleCount;

    // Clear canvas
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, 0, size, size);

    // Draw dots
    ctx.fillStyle = primaryColor;
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            // @ts-ignore
            if (qr._oQRCode.isDark(row, col)) {
                 // Don't draw dots in the center where the logo will be
                if (
                    row > moduleCount * 0.35 && row < moduleCount * 0.65 &&
                    col > moduleCount * 0.35 && col < moduleCount * 0.65
                ) {
                    continue;
                }
                ctx.beginPath();
                ctx.arc(
                    col * moduleSize + moduleSize / 2,
                    row * moduleSize + moduleSize / 2,
                    moduleSize / 2.5, // dot radius
                    0, 2 * Math.PI
                );
                ctx.fill();
            }
        }
    }

    // Draw logo
    if (logoRef.current) {
        const logoSize = size * 0.3;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;
        
        ctx.fillStyle = secondaryColor; // Background for the logo
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
        ctx.drawImage(logoRef.current, logoX, logoY, logoSize, logoSize);
    }
  }, [data, size, primaryColor, secondaryColor, logoLoaded]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: '8px' }} />;
};

export default StyledQRCode;
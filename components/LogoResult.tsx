import React from 'react';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import { Button } from './Button';

interface LogoResultProps {
  imageUrl: string;
  onReset: () => void;
}

export const LogoResult: React.FC<LogoResultProps> = ({ imageUrl, onReset }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `sajangnim-logo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">사장님의 로고가 완성되었습니다! 🎉</h2>
        <p className="text-slate-500">아래 이미지를 확인하고 저장하세요.</p>
      </div>

      <div className="relative group bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full aspect-square flex items-center justify-center overflow-hidden">
        {/* Checkered background for transparency illusion if needed, but logo is white bg mostly */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
        <img 
          src={imageUrl} 
          alt="Generated Logo" 
          className="relative z-10 w-full h-full object-contain rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button onClick={handleDownload} className="flex-1 gap-2">
          <Download className="w-5 h-5" />
          이미지 다운로드
        </Button>
        <Button variant="outline" onClick={onReset} className="flex-1 gap-2">
          <RefreshCw className="w-5 h-5" />
          새로 만들기
        </Button>
      </div>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg text-sm text-orange-800 max-w-md text-center">
        💡 <b>팁:</b> 다운로드한 이미지는 명함, 간판, 배달앱 로고 등으로 자유롭게 활용하실 수 있습니다.
      </div>
    </div>
  );
};

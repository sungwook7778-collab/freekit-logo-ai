import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface LogoResultProps {
  imageUrls: string[];
  onReset: () => void;
}

export const LogoResult: React.FC<LogoResultProps> = ({ imageUrls, onReset }) => {
  const handleDownload = (url: string, idx: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `sajangnim-logo-${idx + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">3가지 로고 옵션이 준비되었어요! 🎉</h2>
        <p className="text-slate-500">마음에 드는 것을 선택하거나 모두 저장해 보세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {imageUrls.map((url, idx) => (
          <div
            key={idx}
            className="relative group bg-white p-3 rounded-2xl shadow-xl border border-slate-100 aspect-square flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
            <img
              src={url}
              alt={`Generated Logo ${idx + 1}`}
              className="relative z-10 w-full h-full object-contain rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
            <Button onClick={() => handleDownload(url, idx)} className="mt-3 w-full gap-2">
              <Download className="w-5 h-5" />
              {idx + 1}번 다운로드
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button variant="outline" onClick={onReset} className="flex-1 gap-2">
          <RefreshCw className="w-5 h-5" />
          새로 만들기
        </Button>
      </div>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg text-sm text-orange-800 max-w-3xl text-center">
        💡 <b>팁:</b> 여러 옵션을 모두 다운로드한 뒤, 마음에 드는 컬러나 레이아웃을 참고해 최종안을 선택하세요.
      </div>
    </div>
  );
};

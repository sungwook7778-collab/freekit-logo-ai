import React, { useRef, useState } from 'react';
import { ChefHat, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { CuisineType, LogoFormData } from './types';
import { generateLogoImages } from './services/geminiService';
import { InputField } from './components/InputField';
import { SelectField } from './components/SelectField';
import { Button } from './components/Button';
import { LogoResult } from './components/LogoResult';

function App() {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [formData, setFormData] = useState<LogoFormData>({
    businessName: '',
    cuisine: CuisineType.KOREAN,
    additionalDetails: '',
    referenceImage: null
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName) {
      alert("상호명을 입력해주세요.");
      return;
    }
    
    setStep('loading');
    setError(null);
    
    try {
      const images = await generateLogoImages(formData);
      setGeneratedImages(images);
      setStep('result');
    } catch (err) {
      setError("로고 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setStep('form');
    }
  };

  const handleReset = () => {
    setStep('form');
    setGeneratedImages([]);
    setError(null);
    setFormData({
      businessName: '',
      cuisine: CuisineType.KOREAN,
      additionalDetails: '',
      referenceImage: null,
    });
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    const maxSizeMB = 3;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`이미지 크기가 너무 큽니다. ${maxSizeMB}MB 이하로 업로드해주세요.`);
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setFormData(prev => ({ ...prev, referenceImage: dataUrl }));
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePasteImage = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          await handleFileChange(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const removeReferenceImage = () => {
    setFormData(prev => ({ ...prev, referenceImage: null }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-600">
            <div className="bg-orange-100 p-2 rounded-lg">
              <ChefHat className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">사장님로고 AI</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a
              href="https://www.freekitlab.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-orange-500 transition-colors"
            >
              이용문의
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          
          {/* Hero Section (Only show on form step) */}
          {step === 'form' && (
            <div className="text-center mb-10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                우리 가게의 첫인상,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                  AI로 10초 만에 완성하세요
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg mx-auto">
                복잡한 설정 없이 가게 이름만 입력하세요.<br/>
                디자이너가 작업한 듯한 고퀄리티 로고를 만들어드립니다.
              </p>
            </div>
          )}

          {/* Form Step */}
          {step === 'form' && (
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 animate-in fade-in zoom-in duration-500">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <InputField
                      label="가게 이름 (상호명)"
                      name="businessName"
                      placeholder="예: 맛있는 김밥, 카페 드 몽"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <SelectField
                      label="업종 카테고리"
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleInputChange}
                      options={Object.values(CuisineType).map(v => ({ label: v, value: v }))}
                    />
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-1.5">
                       <label className="text-sm font-semibold text-slate-700">추가 요청사항 (선택)</label>
                       <span className="text-[11px] text-slate-500">이미지 붙여넣기 또는 드래그앤드롭으로 첨부 가능</span>
                     </div>
                     <textarea 
                        name="additionalDetails"
                        value={formData.additionalDetails}
                        onChange={handleInputChange}
                        onPaste={handlePasteImage}
                        onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file) handleFileChange(file); }}
                        onDragOver={(e) => e.preventDefault()}
                        placeholder="예: 젓가락과 국수 그릇을 심플하게 표현해주세요. / 커피잔 위에 따뜻한 김이 나는 모습을 원해요. (이미지 붙여넣기·드래그앤드롭 가능)"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none resize-none h-32"
                     />
                     <input
                       ref={fileInputRef}
                       type="file"
                       accept="image/*"
                       className="hidden"
                       onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                     />
                     {formData.referenceImage && (
                       <div className="flex items-center gap-3 p-3 mt-3 rounded-lg border border-slate-200 bg-slate-50">
                         <img
                           src={formData.referenceImage}
                           alt="참고 이미지 미리보기"
                           className="w-16 h-16 object-contain rounded border border-slate-200 bg-white"
                         />
                         <div className="flex-1 text-sm text-slate-600">
                           참고 이미지가 첨부되었습니다. (붙여넣기/드래그/클릭으로 교체 가능)
                         </div>
                         <Button variant="outline" type="button" onClick={removeReferenceImage}>
                           제거
                         </Button>
                       </div>
                     )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full py-4 text-lg gap-2 group">
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  로고 무료 생성하기
                </Button>
                <p className="text-center text-xs text-slate-400">
                  freekitlab · www.freekitlab.com
                </p>
              </form>
            </div>
          )}

          {/* Loading Step */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                  <Sparkles className="w-16 h-16 text-orange-500 animate-spin-slow" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">freekitlab이 로고를 생성 중입니다</h3>
                <p className="text-slate-500">상호명과 요청사항을 반영한 심볼을 정교하게 그리는 중...</p>
              </div>
              
              <div className="w-64 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-orange-500 h-2.5 rounded-full animate-progress"></div>
              </div>
              
              <style>{`
                @keyframes spin-slow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                  animation: spin-slow 3s linear infinite;
                }
                @keyframes progress {
                  0% { width: 0%; }
                  50% { width: 70%; }
                  100% { width: 95%; }
                }
                .animate-progress {
                  animation: progress 8s ease-out forwards;
                }
              `}</style>
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && generatedImages.length > 0 && (
            <LogoResult imageUrls={generatedImages} onReset={handleReset} />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p className="flex items-center justify-center gap-1 mb-2">
            Made with <span className="text-red-400">❤</span> for 소상공인
          </p>
          <p>© {new Date().getFullYear()} 사장님로고 AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

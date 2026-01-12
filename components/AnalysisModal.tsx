
import React, { useState } from 'react';
import { CommentAnalysis, YouTubeVideo, ScriptOutline } from '../types';
import { generateScriptOutline } from '../services/geminiService';

interface AnalysisModalProps {
  video: YouTubeVideo;
  analysis: CommentAnalysis;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ video, analysis, onClose }) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [outline, setOutline] = useState<ScriptOutline | null>(null);
  const [loadingOutline, setLoadingOutline] = useState(false);

  const handleKeywordSelect = async (kw: string) => {
    setSelectedKeyword(kw);
    setLoadingOutline(true);
    setOutline(null);
    try {
      const res = await generateScriptOutline(kw);
      setOutline(res);
    } catch (err) {
      alert('목차 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingOutline(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#181818] text-white rounded-3xl w-full max-w-5xl my-auto shadow-2xl border border-white/10 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#181818] z-10 rounded-t-3xl">
          <div className="flex gap-4 items-center">
             <img src={video.thumbnail} className="w-20 h-12 object-cover rounded-lg border border-white/10" alt="" />
             <div>
                <h2 className="text-lg font-bold line-clamp-1">{video.title}</h2>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">AI Content Lab</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Comment Analysis */}
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 시청자 반응 분석
              </h3>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-sm text-gray-300 italic leading-relaxed">
                "{analysis.sentiment}"
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> 추천 핵심 키워드 (택1)
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendedKeywords.map((kw, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleKeywordSelect(kw)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      selectedKeyword === kw 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-white'
                    }`}
                  >
                    #{kw}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-3 font-medium">키워드를 선택하면 해당 주제로 AI가 대본 목차를 작성합니다.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> 주요 언급 키워드
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.commonKeywords.map((kw, i) => (
                  <span key={i} className="text-[11px] bg-white/5 border border-white/5 px-2 py-1 rounded-md text-gray-400">
                    {kw}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Script Outline Generation */}
          <div className="bg-black/20 rounded-3xl p-6 border border-white/5 min-h-[400px]">
             {!selectedKeyword ? (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                 <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 <p className="font-bold">키워드를 선택해 대본을 생성하세요</p>
               </div>
             ) : loadingOutline ? (
               <div className="h-full flex flex-col items-center justify-center text-center">
                 <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-sm font-bold text-indigo-400 animate-pulse">"{selectedKeyword}" 키워드 분석 및 목차 구성 중...</p>
               </div>
             ) : outline ? (
               <div className="animate-in fade-in duration-500">
                  <div className="mb-6">
                    <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-1 rounded uppercase mr-2">Draft</span>
                    <h4 className="text-xl font-black text-white mt-2 leading-tight">{outline.title}</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-xs font-bold text-indigo-400 uppercase mb-2">Hook (인트로)</h5>
                      <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl">{outline.hook}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-bold text-indigo-400 uppercase mb-3">Chapters (전개)</h5>
                      <div className="space-y-4">
                        {outline.chapters.map((ch, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex-shrink-0 flex items-center justify-center text-xs font-black">{i+1}</div>
                            <div>
                              <p className="text-sm font-bold text-gray-100">{ch.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{ch.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <h5 className="text-xs font-bold text-indigo-400 uppercase mb-2">Call to Action</h5>
                      <p className="text-sm text-gray-300 leading-relaxed">{outline.cta}</p>
                    </div>
                  </div>
               </div>
             ) : null}
          </div>
        </div>
        
        <div className="p-6 bg-white/5 flex justify-center rounded-b-3xl">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Experimental AI Content Engine © 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;

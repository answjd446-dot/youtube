
import React, { useState } from 'react';
import { searchVideos, fetchComments } from './services/youtubeService';
import { analyzeCommentsAndSuggest } from './services/geminiService';
import { YouTubeVideo, CommentAnalysis, VideoType } from './types';
import VideoCard from './components/VideoCard';
import AnalysisModal from './components/AnalysisModal';

const App: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [videoType, setVideoType] = useState<VideoType>('all');
  
  const [analyzingVideoId, setAnalyzingVideoId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<{ video: YouTubeVideo, analysis: CommentAnalysis } | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [youtubeKey, setYoutubeKey] = useState(localStorage.getItem('YOUTUBE_API_KEY') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('YOUTUBE_API_KEY', youtubeKey);
    localStorage.setItem('GEMINI_API_KEY', geminiKey);
    setShowSettings(false);
    alert('설정이 저장되었습니다.');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    if (!localStorage.getItem('YOUTUBE_API_KEY')) {
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchVideos(keyword, videoType);
      // 필터 없이 모든 결과를 성과순으로 정렬만 해서 표시
      const sorted = [...results].sort((a, b) => b.efficiencyRatio - a.efficiencyRatio);
      setVideos(sorted);
    } catch (err: any) {
      setError(err.message || '검색 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (video: YouTubeVideo) => {
    if (!localStorage.getItem('GEMINI_API_KEY')) {
      setShowSettings(true);
      return;
    }
    setAnalyzingVideoId(video.id);
    try {
      const comments = await fetchComments(video.id);
      const analysis = await analyzeCommentsAndSuggest(comments, video.title);
      setSelectedAnalysis({ video, analysis });
    } catch (err: any) {
      alert(err.message || '분석 중 오류 발생');
    } finally {
      setAnalyzingVideoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Navigation */}
      <nav className="bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 h-20 flex items-center">
        <div className="max-w-[1600px] mx-auto px-6 w-full flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="text-red-600">
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            </div>
            <span className="text-xl font-black tracking-tighter hidden md:block">InsightMiner</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="관심 키워드를 검색하세요..."
              className="w-full bg-[#121212] border border-[#303030] rounded-full py-3 px-6 pr-24 focus:border-indigo-500 outline-none transition-all text-base"
            />
            <button className="absolute right-2 top-1.5 bottom-1.5 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95">
              검색
            </button>
          </form>

          <button onClick={() => setShowSettings(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div>
              <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">Insight Discovery</h2>
              <p className="text-gray-500 text-sm">성과 지표가 높은 고효율 소재를 발굴합니다.</p>
            </div>

            {/* 고도화된 영상 타입 필터 (숏츠/롱폼) */}
            <div className="flex p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
              {[
                { id: 'all', label: '전체', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                { id: 'long', label: '동영상 (Long)', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                { id: 'shorts', label: '숏츠 (Shorts)', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setVideoType(t.id as VideoType)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    videoType === t.id 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
                  </svg>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 aspect-video rounded-2xl"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center"><p className="text-red-400 font-bold">{error}</p></div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onAnalyze={handleAnalyze} isAnalyzing={analyzingVideoId === video.id} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
            <svg className="w-24 h-24 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-xl font-bold uppercase tracking-[0.2em]">Start Mining Insight</p>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">API Configuration</h2>
            <form onSubmit={saveSettings} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">YouTube Data API v3 Key</label>
                <input type="password" value={youtubeKey} onChange={(e) => setYoutubeKey(e.target.value)} placeholder="AIza..." className="w-full bg-[#0f0f0f] border border-[#333] rounded-xl py-3 px-4 focus:border-indigo-500 outline-none text-sm font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Gemini Pro API Key</label>
                <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIza..." className="w-full bg-[#0f0f0f] border border-[#333] rounded-xl py-3 px-4 focus:border-indigo-500 outline-none text-sm font-mono" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]">Save Settings</button>
              <button type="button" onClick={() => setShowSettings(false)} className="w-full text-xs text-gray-500 font-bold hover:text-white mt-2">Close</button>
            </form>
          </div>
        </div>
      )}

      {selectedAnalysis && (
        <AnalysisModal video={selectedAnalysis.video} analysis={selectedAnalysis.analysis} onClose={() => setSelectedAnalysis(null)} />
      )}
    </div>
  );
};

export default App;

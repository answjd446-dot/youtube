
import React from 'react';
import { YouTubeVideo } from '../types';

interface VideoCardProps {
  video: YouTubeVideo;
  onAnalyze: (video: YouTubeVideo) => void;
  isAnalyzing: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onAnalyze, isAnalyzing }) => {
  const getEfficiencyBadge = (ratio: number) => {
    if (ratio >= 5) return 'bg-red-500/20 text-red-500 border-red-500/50';
    if (ratio >= 2) return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="group relative bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/5 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-black/50">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
          {video.efficiencyRatio >= 2 ? 'High Efficiency' : 'Normal'}
        </div>
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-[10px] font-bold text-indigo-400">AI ANALYZING</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-sm text-gray-100 line-clamp-2 h-10 mb-1 leading-tight" title={video.title}>
          {video.title}
        </h3>
        <p className="text-xs text-gray-400 mb-4 hover:text-white cursor-pointer transition-colors inline-block">
          {video.channelTitle}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getEfficiencyBadge(video.efficiencyRatio)}`}>
            {video.efficiencyRatio}x Impact
          </div>
          <span className="text-[10px] text-gray-500">
            Subs: {(video.subscriberCount / 1000).toFixed(1)}k
          </span>
        </div>

        <button
          onClick={() => onAnalyze(video)}
          disabled={isAnalyzing}
          className="w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white active:scale-95 disabled:opacity-50"
        >
          {!isAnalyzing && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          {isAnalyzing ? '분석 중...' : '데이터 분석'}
        </button>
      </div>
    </div>
  );
};

export default VideoCard;

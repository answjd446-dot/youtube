
import { YouTubeVideo, VideoType } from '../types';

function getApiKey(): string {
  return localStorage.getItem('YOUTUBE_API_KEY') || '';
}

export async function searchVideos(keyword: string, type: VideoType = 'all'): Promise<YouTubeVideo[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('유튜브 API 키가 설정되지 않았습니다.');
  }

  // 유튜브 API는 직접적인 Shorts 필터가 없으므로 duration으로 구분 (any, long, medium, short)
  let durationParam = '';
  if (type === 'shorts') durationParam = '&videoDuration=short'; // 4분 미만
  if (type === 'long') durationParam = '&videoDuration=medium'; // 4~20분 (any도 가능하나 명확성을 위해)

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(keyword)}&type=video${durationParam}&key=${apiKey}`;
  
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (searchData.error) throw new Error(searchData.error.message);
  if (!searchData.items) return [];

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`;
  
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();

  const channelIds = statsData.items.map((item: any) => item.snippet.channelId).join(',');
  const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${apiKey}`;
  
  const channelsRes = await fetch(channelsUrl);
  const channelsData = await channelsRes.json();

  const channelStatsMap = new Map();
  channelsData.items.forEach((item: any) => {
    channelStatsMap.set(item.id, parseInt(item.statistics.subscriberCount) || 1);
  });

  return statsData.items.map((item: any): YouTubeVideo => {
    const viewCount = parseInt(item.statistics.viewCount) || 0;
    const subCount = channelStatsMap.get(item.snippet.channelId) || 1;
    return {
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      viewCount,
      subscriberCount: subCount,
      efficiencyRatio: parseFloat((viewCount / subCount).toFixed(2)),
      commentCount: parseInt(item.statistics.commentCount) || 0,
      publishedAt: item.snippet.publishedAt,
    };
  });
}

export async function fetchComments(videoId: string): Promise<string[]> {
  const apiKey = getApiKey();
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map((item: any) => item.snippet.topLevelComment.snippet.textDisplay);
}

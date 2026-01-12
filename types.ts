
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  viewCount: number;
  subscriberCount: number;
  efficiencyRatio: number; // View count / Subscriber count
  commentCount: number;
  publishedAt: string;
}

export interface CommentAnalysis {
  sentiment: string;
  commonKeywords: string[];
  userNeeds: string[];
  suggestedTopics: string[];
  recommendedKeywords: string[]; // 5개의 추천 핵심 키워드
}

export interface ScriptOutline {
  title: string;
  hook: string;
  chapters: { title: string; detail: string }[];
  cta: string;
}

export type VideoType = 'all' | 'shorts' | 'long';

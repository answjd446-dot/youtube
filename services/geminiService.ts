
import { GoogleGenAI, Type } from "@google/genai";
import { CommentAnalysis, ScriptOutline } from "../types";

function getGeminiApiKey(): string {
  return localStorage.getItem('GEMINI_API_KEY') || process.env.API_KEY || '';
}

export async function analyzeCommentsAndSuggest(comments: string[], videoTitle: string): Promise<CommentAnalysis> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('Gemini API 키가 설정되지 않았습니다.');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `당신은 유튜브 트렌드 분석가입니다. 다음 영상의 댓글들을 분석하세요: "${videoTitle}"
  1. 감성 분석, 2. 자주 언급된 키워드, 3. 시청자 니즈, 4. 3-5개 추천 콘텐츠 주제를 도출하세요.
  추가로, 이 영상의 반응을 바탕으로 다음 콘텐츠를 제작할 때 사용할 '5개의 핵심 추천 키워드'를 별도로 뽑아주세요.
  모두 한국어로 답변하세요.
  
  댓글 목록:
  ${comments.join('\n').substring(0, 4000)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentiment: { type: Type.STRING },
          commonKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          userNeeds: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 distinct short keywords for content creation" },
        },
        required: ["sentiment", "commonKeywords", "userNeeds", "suggestedTopics", "recommendedKeywords"],
      }
    },
  });

  return JSON.parse(response.text);
}

export async function generateScriptOutline(keyword: string): Promise<ScriptOutline> {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `유튜브 키워드 "${keyword}"를 바탕으로 시청자를 사로잡을 수 있는 대본 목차를 작성해줘. 
  제목, 흥미로운 도입부(Hook), 3~4개의 주요 섹션(Chapter), 그리고 마지막 결론 및 CTA를 포함해야 해. 한국어로 작성해줘.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detail: { type: Type.STRING }
              },
              required: ["title", "detail"]
            }
          },
          cta: { type: Type.STRING }
        },
        required: ["title", "hook", "chapters", "cta"],
      }
    },
  });

  return JSON.parse(response.text);
}

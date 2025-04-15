/**
 * API配置
 */

export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
    AIDialog: `${API_BASE_URL}/api/ai-dialog`,
    AIVoice: `${API_BASE_URL}/api/ai-dialog/voice`,
    ArticleAnalysis: `${API_BASE_URL}/api/article-analysis`,
    HotTopics: `${API_BASE_URL}/api/hot-topics`,
    VideoScript: `${API_BASE_URL}/api/video-script`
};

export default API_ENDPOINTS; 
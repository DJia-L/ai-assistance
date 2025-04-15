import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

type AnalysisResult = {
    title: string;
    content_summary: string;
    word_count: number;
    estimated_reading_time: number;
    topics: string[];
    keywords: string[];
    quality_score: number;
    readability_score: number;
    originality_score: number;
    sentiment: string;
    suggestions: string[];
    suitable_platforms: string[];
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AnalysisResult | { error: string }>
) {
    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只允许POST请求' });
    }

    try {
        const { title, content, article_type, target_platform } = req.body;

        // 验证必要参数
        if (!title || !content) {
            return res.status(400).json({ error: '标题和内容是必需的' });
        }

        // 发送请求到后端API
        const response = await axios.post(`${API_BASE_URL}/api/article-analysis`, {
            title,
            content,
            article_type,
            target_platform
        });

        // 返回响应
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('文章分析请求失败:', error);

        // 如果后端服务不可用，使用模拟数据（仅用于开发和演示）
        if (process.env.NODE_ENV === 'development') {
            // 计算字数和阅读时间
            const wordCount = req.body.content?.length || 0;
            const readingTime = Math.max(1, Math.round(wordCount / 500));

            // 生成模拟数据
            const mockResult: AnalysisResult = {
                title: req.body.title || '未提供标题',
                content_summary: req.body.content?.substring(0, 200) + '...' || '未提供内容',
                word_count: wordCount,
                estimated_reading_time: readingTime,
                topics: ['媒体融合', '政策解读', '科技创新'],
                keywords: ['人工智能', '媒体', '创新', '融合'],
                quality_score: 85,
                readability_score: 88,
                originality_score: 82,
                sentiment: '积极',
                suggestions: [
                    '建议添加更多数据支持观点',
                    '可以考虑增加案例分析',
                    '结论部分可以更加明确'
                ],
                suitable_platforms: ['微信公众号', '网站', '头条号']
            };

            return res.status(200).json(mockResult);
        }

        return res.status(500).json({ error: '文章分析请求失败' });
    }
} 
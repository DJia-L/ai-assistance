import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

type ModelOption = {
    id: string;
    name: string;
    description: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ModelOption[] | { error: string }>
) {
    // 只允许GET请求
    if (req.method !== 'GET') {
        return res.status(405).json({ error: '只允许GET请求' });
    }

    try {
        // 尝试从后端API获取模型列表
        const response = await axios.get(`${API_BASE_URL}/api/ai-dialog/models`);
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('获取模型列表失败:', error);

        // 如果出错，返回默认模型列表
        const defaultModels: ModelOption[] = [
            {
                id: 'deepseek',
                name: 'DeepSeek',
                description: '基础大模型，提供通用AI对话能力'
            },
            {
                id: 'ai_xiaorong',
                name: 'AI小融',
                description: '融媒体知识增强版，结合公有知识库，支持单位内部信息查询'
            },
            {
                id: 'ai_xiaomi',
                name: 'AI小秘',
                description: '个人助理增强版，结合个人私有知识库，提供个性化规划和建议'
            }
        ];

        return res.status(200).json(defaultModels);
    }
} 
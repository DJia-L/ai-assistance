import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

type ResponseData = {
    text: string;
    conversation_id: string;
    model?: string;
    knowledge_source?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData | { error: string }>
) {
    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只允许POST请求' });
    }

    try {
        const { text, user_id, conversation_id, model_type } = req.body;

        // 发送请求到后端API
        const response = await axios.post(`${API_BASE_URL}/api/ai-dialog/text`, {
            text,
            user_id,
            conversation_id,
            model_type
        });

        // 返回响应
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('AI对话请求失败:', error);
        return res.status(500).json({ error: 'AI对话请求失败' });
    }
} 
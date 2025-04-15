import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

type ResponseData = {
    text: string;
    conversation_id: string;
    recognized_text?: string;
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
        // 使用formidable解析表单数据
        const form = new formidable.IncomingForm();

        const { fields, files } = await new Promise<{
            fields: formidable.Fields;
            files: formidable.Files;
        }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        // 获取参数
        const user_id = fields.user_id?.[0] || 'anonymous';
        const conversation_id = fields.conversation_id?.[0] || undefined;
        const model_type = fields.model_type?.[0] || 'deepseek';

        // 获取音频文件
        const audioFile = files.audio_file?.[0];

        if (!audioFile) {
            return res.status(400).json({ error: '未找到音频文件' });
        }

        // 读取文件内容
        const fileData = fs.readFileSync(audioFile.filepath);

        // 创建FormData对象发送到后端
        const formData = new FormData();

        // 添加表单字段
        formData.append('user_id', user_id);
        if (conversation_id) {
            formData.append('conversation_id', conversation_id);
        }
        formData.append('model_type', model_type);

        // 添加音频文件
        const audioBlob = new Blob([fileData], { type: 'audio/wav' });
        formData.append('audio_file', audioBlob, 'recording.wav');

        // 发送请求到后端API
        const response = await axios.post(`${API_BASE_URL}/api/ai-dialog/voice`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // 返回响应
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('AI语音对话请求失败:', error);
        return res.status(500).json({ error: 'AI语音对话请求失败' });
    }
} 
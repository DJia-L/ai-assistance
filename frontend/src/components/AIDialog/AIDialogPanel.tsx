import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Select, List, Avatar, Spin, message, Radio, Space, Tooltip } from 'antd';
import { SendOutlined, AudioOutlined, DeleteOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import BackButton from '../common/BackButton';

// AI模型类型
type AIModelType = 'deepseek' | 'ai_xiaorong' | 'ai_xiaomi';

// 消息类型
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    model?: AIModelType;
    knowledgeSource?: string;
}

// 模型选项类型
interface ModelOption {
    id: string;
    name: string;
    description: string;
}

const AIDialogPanel: React.FC = () => {
    // 状态
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<AIModelType>('deepseek');
    const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    // 引用
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // 获取模型选项
    useEffect(() => {
        fetchModelOptions();
    }, []);

    // 滚动到消息列表底部
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 欢迎消息
    useEffect(() => {
        // 只在组件首次加载时添加欢迎消息
        if (messages.length === 0) {
            setMessages([
                {
                    id: '0',
                    role: 'assistant',
                    content: '您好，我是融媒体AI助手。请选择您要使用的模式：\n\n• DeepSeek - 基础大模型\n• AI小融 - 融媒体知识库增强版\n• AI小秘 - 个人助理增强版',
                    timestamp: new Date(),
                    model: 'deepseek'
                }
            ]);
        }
    }, []);

    const fetchModelOptions = async () => {
        try {
            const response = await axios.get('/api/ai-dialog/models');
            setModelOptions(response.data);
        } catch (error) {
            console.error('获取模型选项失败:', error);
            message.error('获取模型选项失败，请稍后再试');
            // 设置默认选项
            setModelOptions([
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
            ]);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleModelChange = (value: AIModelType) => {
        setSelectedModel(value);
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;

        // 添加用户消息
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsProcessing(true);

        try {
            // 发送API请求
            const response = await axios.post('/api/ai-dialog/text', {
                text: input,
                user_id: 'current_user', // 实际项目中应使用真实用户ID
                conversation_id: conversationId,
                model_type: selectedModel
            });

            // 保存会话ID
            if (response.data.conversation_id) {
                setConversationId(response.data.conversation_id);
            }

            // 添加AI回复
            const assistantMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: response.data.text,
                timestamp: new Date(),
                model: response.data.model,
                knowledgeSource: response.data.knowledge_source
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('发送消息失败:', error);
            message.error('发送消息失败，请稍后再试');
        } finally {
            setIsProcessing(false);
        }
    };

    const startRecording = async () => {
        try {
            // 获取媒体流
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);

            // 创建媒体记录器
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            // 重置音频块
            audioChunksRef.current = [];

            // 配置记录器事件
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                sendAudioToAPI(audioBlob);
            };

            // 开始录音
            recorder.start();
            setIsRecording(true);
            message.info('正在录音...');
        } catch (error) {
            console.error('启动录音失败:', error);
            message.error('无法访问麦克风，请检查权限设置');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);

            // 停止所有音轨
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }

            message.info('录音已完成，正在处理...');
        }
    };

    const sendAudioToAPI = async (blob: Blob) => {
        setIsProcessing(true);

        // 创建FormData对象
        const formData = new FormData();
        formData.append('audio_file', blob, 'recording.wav');
        formData.append('user_id', 'current_user'); // 实际项目中应使用真实用户ID
        formData.append('model_type', selectedModel);

        if (conversationId) {
            formData.append('conversation_id', conversationId);
        }

        try {
            // 添加"正在收听..."消息
            const userMessage: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: '🎤 [语音输入]',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);

            // 发送录音到API
            const response = await axios.post('/api/ai-dialog/voice', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // 保存会话ID
            if (response.data.conversation_id) {
                setConversationId(response.data.conversation_id);
            }

            // 更新用户消息（如果API返回了识别的文本）
            if (response.data.recognized_text) {
                setMessages(prev => prev.map(msg =>
                    msg.id === userMessage.id
                        ? { ...msg, content: response.data.recognized_text }
                        : msg
                ));
            }

            // 添加AI回复
            const assistantMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: response.data.text,
                timestamp: new Date(),
                model: response.data.model,
                knowledgeSource: response.data.knowledge_source
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('发送语音失败:', error);
            message.error('语音处理失败，请稍后再试');
        } finally {
            setIsProcessing(false);
        }
    };

    const clearConversation = async () => {
        if (!conversationId) return;

        try {
            await axios.delete(`/api/ai-dialog/conversation/${conversationId}`, {
                params: { user_id: 'current_user' } // 实际项目中应使用真实用户ID
            });

            setMessages([]);
            setConversationId(null);

            // 添加新的欢迎消息
            setMessages([
                {
                    id: '0',
                    role: 'assistant',
                    content: '对话已重置。请问有什么可以帮您？',
                    timestamp: new Date(),
                    model: selectedModel
                }
            ]);

            message.success('对话已重置');
        } catch (error) {
            console.error('清除对话失败:', error);
            message.error('清除对话失败，请稍后再试');
        }
    };

    const getAvatarForMessage = (message: Message) => {
        if (message.role === 'user') {
            return <Avatar icon={<UserOutlined />} />;
        }

        // 根据不同的AI模型返回不同的头像
        switch (message.model) {
            case 'ai_xiaorong':
                return <Avatar style={{ backgroundColor: '#1890ff' }}>融</Avatar>;
            case 'ai_xiaomi':
                return <Avatar style={{ backgroundColor: '#52c41a' }}>秘</Avatar>;
            default:
                return <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#722ed1' }} />;
        }
    };

    return (
        <div className="ai-dialog-container">
            <BackButton />
            <Card
                title="AI语音对话系统"
                style={{ width: '100%', height: '100%' }}
                extra={
                    <Space>
                        <Select
                            value={selectedModel}
                            onChange={handleModelChange}
                            style={{ width: 120 }}
                            options={modelOptions.map(option => ({
                                value: option.id,
                                label: option.name
                            }))}
                        />
                        <Tooltip title="清除对话">
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={clearConversation}
                                disabled={!conversationId}
                            />
                        </Tooltip>
                    </Space>
                }
            >
                {/* 消息列表 */}
                <div style={{ height: 400, overflowY: 'auto', marginBottom: 16, padding: 10 }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={messages}
                        renderItem={message => (
                            <List.Item style={{
                                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: 10
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                                    alignItems: 'flex-start',
                                    maxWidth: '80%'
                                }}>
                                    {getAvatarForMessage(message)}
                                    <div style={{
                                        background: message.role === 'user' ? '#e6f7ff' : '#f0f2f5',
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        marginLeft: message.role === 'user' ? 0 : 8,
                                        marginRight: message.role === 'user' ? 8 : 0,
                                        wordBreak: 'break-word'
                                    }}>
                                        {message.content.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i < message.content.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                        {message.knowledgeSource && (
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#8c8c8c',
                                                marginTop: 4,
                                                fontStyle: 'italic'
                                            }}>
                                                来源: {message.knowledgeSource}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                    <div ref={messagesEndRef} />
                </div>

                {/* 录音中指示器 */}
                {isRecording && (
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Spin /> 正在录音...
                        <Button
                            type="primary"
                            danger
                            style={{ marginLeft: 8 }}
                            onClick={stopRecording}
                        >
                            停止录音
                        </Button>
                    </div>
                )}

                {/* 输入区域 */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Input
                        placeholder="输入消息..."
                        value={input}
                        onChange={handleInputChange}
                        onPressEnter={handleSubmit}
                        disabled={isProcessing || isRecording}
                        style={{ marginRight: 8, flex: 1 }}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        disabled={!input.trim() || isProcessing || isRecording}
                        style={{ marginRight: 8 }}
                    />
                    <Button
                        type={isRecording ? "primary" : "default"}
                        icon={<AudioOutlined />}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                        danger={isRecording}
                    />
                </div>

                {/* 模型描述 */}
                <div style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>
                    {modelOptions.find(option => option.id === selectedModel)?.description || ''}
                </div>
            </Card>
        </div>
    );
};

export default AIDialogPanel; 
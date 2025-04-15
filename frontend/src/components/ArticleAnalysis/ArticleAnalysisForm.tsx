import React, { useState } from 'react';
import { Form, Input, Button, Select, Upload, message, Card, Typography, Spin } from 'antd';
import { UploadOutlined, FileTextOutlined, ScanOutlined } from '@ant-design/icons';
import axios from 'axios';
import styled from 'styled-components';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Option } = Select;

const FormContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const StyledCard = styled(Card)`
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
`;

const ResultContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ResultSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ScoreTag = styled.span<{ score: number }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  color: white;
  background-color: ${props => {
        if (props.score >= 90) return '#52c41a';
        if (props.score >= 80) return '#1890ff';
        if (props.score >= 70) return '#faad14';
        return '#f5222d';
    }};
`;

interface AnalysisResult {
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
}

const ArticleAnalysisForm: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        setResult(null);

        try {
            // 提交表单数据到API
            const response = await axios.post('/api/article-analysis', {
                title: values.title,
                content: values.content,
                article_type: values.article_type,
                target_platform: values.target_platform
            });

            setResult(response.data);
            message.success('分析完成');
        } catch (error) {
            console.error('分析请求失败:', error);
            message.error('分析请求失败，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        form.resetFields();
        setResult(null);
    };

    return (
        <FormContainer>
            <StyledCard>
                <Title level={2}>
                    <FileTextOutlined /> 稿件分析系统
                </Title>
                <Paragraph>
                    上传或输入您的文章内容，获取AI辅助分析结果，包括关键词提取、质量评分、可读性分析等。
                </Paragraph>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="文章标题"
                        rules={[{ required: true, message: '请输入文章标题' }]}
                    >
                        <Input placeholder="请输入文章标题" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="文章内容"
                        rules={[{ required: true, message: '请输入文章内容' }]}
                    >
                        <TextArea
                            placeholder="请输入文章内容"
                            rows={10}
                            showCount
                            maxLength={10000}
                        />
                    </Form.Item>

                    <Form.Item
                        name="article_type"
                        label="文章类型"
                        initialValue="news"
                    >
                        <Select placeholder="选择文章类型">
                            <Option value="news">新闻</Option>
                            <Option value="opinion">评论</Option>
                            <Option value="feature">特写</Option>
                            <Option value="interview">访谈</Option>
                            <Option value="report">报道</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="target_platform"
                        label="目标平台"
                        initialValue="wechat"
                    >
                        <Select placeholder="选择目标发布平台">
                            <Option value="wechat">微信公众号</Option>
                            <Option value="weibo">微博</Option>
                            <Option value="website">网站</Option>
                            <Option value="newspaper">报纸</Option>
                            <Option value="toutiao">头条号</Option>
                            <Option value="douyin">抖音</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: '10px' }}>
                            分析文章
                        </Button>
                        <Button onClick={handleReset}>
                            重置
                        </Button>
                    </Form.Item>
                </Form>
            </StyledCard>

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 20 }}>正在分析文章，请稍候...</p>
                </div>
            )}

            {result && (
                <ResultContainer>
                    <Title level={3}>分析结果</Title>

                    <ResultSection>
                        <Title level={4}>文章基本信息</Title>
                        <p><strong>标题:</strong> {result.title}</p>
                        <p><strong>内容摘要:</strong> {result.content_summary}</p>
                        <p><strong>字数:</strong> {result.word_count}</p>
                        <p><strong>预估阅读时间:</strong> {result.estimated_reading_time} 分钟</p>
                    </ResultSection>

                    <ResultSection>
                        <Title level={4}>关键信息提取</Title>
                        <p><strong>主题:</strong> {result.topics.join(', ')}</p>
                        <p><strong>关键词:</strong> {result.keywords.join(', ')}</p>
                    </ResultSection>

                    <ResultSection>
                        <Title level={4}>质量评估</Title>
                        <p><strong>综合评分:</strong> <ScoreTag score={result.quality_score}>{result.quality_score}</ScoreTag></p>
                        <p><strong>可读性分数:</strong> <ScoreTag score={result.readability_score}>{result.readability_score}</ScoreTag></p>
                        <p><strong>原创性评分:</strong> <ScoreTag score={result.originality_score}>{result.originality_score}</ScoreTag></p>
                        <p><strong>情感倾向:</strong> {result.sentiment}</p>
                    </ResultSection>

                    <ResultSection>
                        <Title level={4}>建议</Title>
                        <ul>
                            {result.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </ResultSection>

                    <ResultSection>
                        <Title level={4}>适合平台</Title>
                        <p>{result.suitable_platforms.join(', ')}</p>
                    </ResultSection>
                </ResultContainer>
            )}
        </FormContainer>
    );
};

export default ArticleAnalysisForm;
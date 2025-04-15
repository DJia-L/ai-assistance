import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select, DatePicker, Button, Tabs, Empty } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserOutlined, FileTextOutlined, EyeOutlined, CommentOutlined, AppstoreOutlined, BarChartOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import BackButton from '../common/BackButton';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 颜色常量
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// 组件接口定义
interface OverallStats {
    total_articles: number;
    platforms: Record<string, number>;
    topics: Record<string, number>;
    total_views: number;
    total_interactions: number;
    avg_quality_score: number;
    original_ratio: number;
}

interface EmployeeStats {
    employee_id: string;
    employee_name: string;
    department: string;
    article_count: number;
    total_views: number;
    total_interactions: number;
    avg_quality_score: number;
    original_count: number;
    best_platform: string;
}

interface DepartmentStats {
    department: string;
    article_count: number;
    total_views: number;
    total_interactions: number;
    avg_quality_score: number;
    original_ratio: number;
    employee_count: number;
    platforms: Record<string, number>;
}

interface PlatformStats {
    platform_name: string;
    platform_type: string;
    article_count: number;
    total_views: number;
    total_interactions: number;
    avg_quality_score: number;
    avg_views: number;
    avg_interactions: number;
    best_topics: string[];
}

interface TrendData {
    dates: string[];
    article_counts: number[];
    view_counts: number[];
    interaction_counts: number[];
}

interface TopArticle {
    id: string;
    title: string;
    employee_name: string;
    department: string;
    platform_name: string;
    topic: string;
    publish_date: string;
    views: number;
    interactions: number;
    quality_score: number;
}

interface ContentLengthStats {
    length_category: string;
    article_count: number;
    avg_views: number;
    avg_interactions: number;
    completion_rate_est: number;
}

// 媒体来源统计接口
interface MediaSourceStats {
    employees: {
        employee_id: string;
        employee_name: string;
        department: string;
        source_stats: Record<string, number>;
        total_count: number;
    }[];
    overall_stats: Record<string, number>;
    media_sources: string[];
}

interface ArticleData {
    title?: string;
    content?: string;
    summary?: string;
    keywords?: string[];
    sentiment?: string;
    topics?: string[];
    entities?: string[];
    publishDate?: string;
    source?: string;
    url?: string;
}

interface Article {
    title: string;
    content: string;
    summary: string;
    keywords: string[];
    sentiment: string;
    topics: string[];
    entities: string[];
    publishDate: string;
    source: string;
    url: string;
}

interface Employee {
    employee_name: string;
    department: string;
    source_stats: Record<string, number>;
    total_count: number;
}

const ArticleAnalysisDashboard: React.FC = () => {
    // 状态定义
    const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
    const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
    const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
    const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
    const [trendData, setTrendData] = useState<TrendData | null>(null);
    const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
    const [contentLengthStats, setContentLengthStats] = useState<ContentLengthStats[]>([]);
    const [mediaSourceStats, setMediaSourceStats] = useState<MediaSourceStats | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [days, setDays] = useState<number>(30);
    const [interval, setInterval] = useState<string>('day');
    const [activeTab, setActiveTab] = useState<string>('1');

    // 加载数据
    useEffect(() => {
        fetchData();
    }, [days, interval]);

    const fetchData = async () => {
        setLoading(true);

        try {
            // 并行获取所有数据
            const [
                overallStatsRes,
                employeeStatsRes,
                departmentStatsRes,
                platformStatsRes,
                trendDataRes,
                topArticlesRes,
                contentLengthStatsRes,
                mediaSourceStatsRes
            ] = await Promise.all([
                axios.get(`/api/article-analysis/stats?days=${days}`),
                axios.get(`/api/article-analysis/employee-stats?days=${days}&top_n=5`),
                axios.get(`/api/article-analysis/department-stats?days=${days}`),
                axios.get(`/api/article-analysis/platform-stats?days=${days}`),
                axios.get(`/api/article-analysis/trend-data?days=${days}&interval=${interval}`),
                axios.get(`/api/article-analysis/top-articles?days=${days}&limit=10`),
                axios.get(`/api/article-analysis/content-length-analysis?days=${days}`),
                axios.get(`/api/article-analysis/media-source-stats?days=${days}`)
            ]);

            setOverallStats(overallStatsRes.data);
            setEmployeeStats(employeeStatsRes.data);
            setDepartmentStats(departmentStatsRes.data);
            setPlatformStats(platformStatsRes.data);
            setTrendData(trendDataRes.data);
            setTopArticles(topArticlesRes.data);
            setContentLengthStats(contentLengthStatsRes.data);
            setMediaSourceStats(mediaSourceStatsRes.data);

        } catch (error) {
            console.error('Error fetching data:', error);
            // 如果API请求失败，使用模拟数据
            setMockData();
        } finally {
            setLoading(false);
        }
    };

    // 设置模拟数据(当API请求失败时)
    const setMockData = () => {
        // 这里可以设置一些模拟数据，保证前端页面正常渲染
        setOverallStats({
            total_articles: 156,
            platforms: { "微信公众号": 45, "微博": 38, "官方网站": 25, "抖音": 30, "头条号": 18 },
            topics: { "政治": 25, "经济": 30, "科技": 40, "文化": 20, "体育": 15, "教育": 10, "健康": 16 },
            total_views: 450000,
            total_interactions: 13500,
            avg_quality_score: 4.2,
            original_ratio: 72.5
        });

        // 其他模拟数据...
    };

    // 数据格式转换函数
    const preparePlatformChartData = () => {
        if (!overallStats) return [];

        return Object.entries(overallStats.platforms).map(([name, value]) => ({
            name,
            value
        }));
    };

    const prepareTopicChartData = () => {
        if (!overallStats) return [];

        return Object.entries(overallStats.topics).map(([name, value]) => ({
            name,
            value
        }));
    };

    const prepareTrendChartData = () => {
        if (!trendData) return [];

        return trendData.dates.map((date, index) => ({
            date,
            articles: trendData.article_counts[index],
            views: trendData.view_counts[index] / 1000, // 转换为千为单位
            interactions: trendData.interaction_counts[index]
        }));
    };

    // 员工表格列定义
    const employeeColumns = [
        {
            title: '员工',
            dataIndex: 'employee_name',
            key: 'employee_name',
        },
        {
            title: '部门',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: '文章数',
            dataIndex: 'article_count',
            key: 'article_count',
            sorter: (a: EmployeeStats, b: EmployeeStats) => a.article_count - b.article_count,
        },
        {
            title: '阅读量',
            dataIndex: 'total_views',
            key: 'total_views',
            sorter: (a: EmployeeStats, b: EmployeeStats) => a.total_views - b.total_views,
            render: (text: number) => text.toLocaleString()
        },
        {
            title: '互动量',
            dataIndex: 'total_interactions',
            key: 'total_interactions',
            sorter: (a: EmployeeStats, b: EmployeeStats) => a.total_interactions - b.total_interactions,
            render: (text: number) => text.toLocaleString()
        },
        {
            title: '质量评分',
            dataIndex: 'avg_quality_score',
            key: 'avg_quality_score',
            sorter: (a: EmployeeStats, b: EmployeeStats) => a.avg_quality_score - b.avg_quality_score,
        },
        {
            title: '最佳平台',
            dataIndex: 'best_platform',
            key: 'best_platform',
        }
    ];

    // 热门文章表格列定义
    const topArticleColumns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 300,
            ellipsis: true,
        },
        {
            title: '作者',
            dataIndex: 'employee_name',
            key: 'employee_name',
        },
        {
            title: '部门',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: '平台',
            dataIndex: 'platform_name',
            key: 'platform_name',
        },
        {
            title: '主题',
            dataIndex: 'topic',
            key: 'topic',
        },
        {
            title: '发布日期',
            dataIndex: 'publish_date',
            key: 'publish_date',
            sorter: (a: TopArticle, b: TopArticle) => new Date(a.publish_date).getTime() - new Date(b.publish_date).getTime(),
        },
        {
            title: '阅读量',
            dataIndex: 'views',
            key: 'views',
            sorter: (a: TopArticle, b: TopArticle) => a.views - b.views,
            render: (text: number) => text.toLocaleString()
        },
        {
            title: '互动量',
            dataIndex: 'interactions',
            key: 'interactions',
            sorter: (a: TopArticle, b: TopArticle) => a.interactions - b.interactions,
            render: (text: number) => text.toLocaleString()
        }
    ];

    // 内容长度分析表格定义
    const contentLengthColumns = [
        {
            title: '内容长度',
            dataIndex: 'length_category',
            key: 'length_category',
        },
        {
            title: '文章数',
            dataIndex: 'article_count',
            key: 'article_count',
        },
        {
            title: '平均阅读量',
            dataIndex: 'avg_views',
            key: 'avg_views',
            render: (text: number) => text.toLocaleString()
        },
        {
            title: '平均互动量',
            dataIndex: 'avg_interactions',
            key: 'avg_interactions',
            render: (text: number) => text.toLocaleString()
        },
        {
            title: '估计完成率',
            dataIndex: 'completion_rate_est',
            key: 'completion_rate_est',
            render: (text: number) => `${text}%`
        }
    ];

    // 媒体来源统计表格列定义
    const getMediaSourceColumns = (mediaSources: string[]): ColumnsType<Employee> => {
        const columns: ColumnsType<Employee> = [
            {
                title: '员工',
                dataIndex: 'employee_name',
                key: 'employee_name',
                fixed: 'left',
                width: 100,
            },
            {
                title: '部门',
                dataIndex: 'department',
                key: 'department',
                fixed: 'left',
                width: 120,
            },
        ];

        // 为每个媒体来源添加列
        mediaSources.forEach(source => {
            columns.push({
                title: source,
                dataIndex: ['source_stats', source],
                key: source,
                width: 120,
                render: (text: number) => text || 0,
            });
        });

        // 添加合计列
        columns.push({
            title: '合计',
            dataIndex: 'total_count',
            key: 'total_count',
            fixed: 'left',
            width: 100,
        });

        return columns;
    };

    // 准备媒体来源图表数据
    const prepareMediaSourceChartData = () => {
        if (!mediaSourceStats) return [];

        return Object.entries(mediaSourceStats.overall_stats).map(([name, value]) => ({
            name,
            value
        }));
    };

    const processArticleData = (articleData: ArticleData): Article => {
        return {
            title: articleData.title ?? '无标题',
            content: articleData.content ?? '无内容',
            summary: articleData.summary ?? '无摘要',
            keywords: articleData.keywords ?? [],
            sentiment: articleData.sentiment ?? 'neutral',
            topics: articleData.topics ?? [],
            entities: articleData.entities ?? [],
            publishDate: articleData.publishDate ?? new Date().toISOString(),
            source: articleData.source ?? '未知来源',
            url: articleData.url ?? '#'
        };
    };

    return (
        <div className="article-analysis-page">
            <BackButton />
            <div className="article-analysis-dashboard">
                <Card title="稿件分析系统" extra={
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Select
                            defaultValue={days}
                            style={{ width: 120 }}
                            onChange={(value) => setDays(value)}
                        >
                            <Option value={7}>近7天</Option>
                            <Option value={30}>近30天</Option>
                            <Option value={90}>近3个月</Option>
                            <Option value={180}>近6个月</Option>
                        </Select>

                        <Button type="primary" onClick={fetchData}>刷新数据</Button>
                    </div>
                }>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane tab="总览" key="1">
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Empty description="数据加载中..." />
                                </div>
                            ) : (
                                <>
                                    {/* 顶部统计卡片 */}
                                    <Row gutter={[16, 16]}>
                                        <Col span={6}>
                                            <Card>
                                                <Statistic
                                                    title="文章总数"
                                                    value={overallStats?.total_articles || 0}
                                                    prefix={<FileTextOutlined />}
                                                />
                                            </Card>
                                        </Col>
                                        <Col span={6}>
                                            <Card>
                                                <Statistic
                                                    title="总阅读量"
                                                    value={overallStats?.total_views || 0}
                                                    prefix={<EyeOutlined />}
                                                    valueStyle={{ color: '#3f8600' }}
                                                />
                                            </Card>
                                        </Col>
                                        <Col span={6}>
                                            <Card>
                                                <Statistic
                                                    title="总互动量"
                                                    value={overallStats?.total_interactions || 0}
                                                    prefix={<CommentOutlined />}
                                                    valueStyle={{ color: '#faad14' }}
                                                />
                                            </Card>
                                        </Col>
                                        <Col span={6}>
                                            <Card>
                                                <Statistic
                                                    title="平均质量评分"
                                                    value={overallStats?.avg_quality_score || 0}
                                                    precision={1}
                                                    valueStyle={{ color: '#cf1322' }}
                                                    suffix="/ 5.0"
                                                />
                                            </Card>
                                        </Col>
                                    </Row>

                                    {/* 图表区域 */}
                                    <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                        <Col span={12}>
                                            <Card title="各平台文章分布">
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={preparePlatformChartData()}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={true}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {preparePlatformChartData().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card title="各主题文章分布">
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={prepareTopicChartData()}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={true}
                                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {prepareTopicChartData().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Card>
                                        </Col>
                                    </Row>

                                    {/* 趋势图 */}
                                    <Card title="文章发布趋势" style={{ marginTop: '16px' }} extra={
                                        <Select defaultValue={interval} style={{ width: 120 }} onChange={setInterval}>
                                            <Option value="day">按天</Option>
                                            <Option value="week">按周</Option>
                                            <Option value="month">按月</Option>
                                        </Select>
                                    }>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={prepareTrendChartData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis yAxisId="left" />
                                                <YAxis yAxisId="right" orientation="right" />
                                                <Tooltip />
                                                <Legend />
                                                <Line yAxisId="left" type="monotone" dataKey="articles" stroke="#8884d8" name="文章数" />
                                                <Line yAxisId="right" type="monotone" dataKey="views" stroke="#82ca9d" name="阅读量(千)" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Card>

                                    {/* 员工绩效 */}
                                    <Card title="员工绩效排行" style={{ marginTop: '16px' }}>
                                        <Table
                                            dataSource={employeeStats}
                                            columns={employeeColumns}
                                            rowKey="employee_id"
                                            pagination={false}
                                            size="middle"
                                        />
                                    </Card>
                                </>
                            )}
                        </TabPane>

                        <TabPane tab="热门文章" key="2">
                            <Card>
                                <Table
                                    dataSource={topArticles}
                                    columns={topArticleColumns}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        </TabPane>

                        <TabPane tab="内容分析" key="3">
                            <Card title="内容长度与阅读量关系">
                                <Table
                                    dataSource={contentLengthStats}
                                    columns={contentLengthColumns}
                                    rowKey="length_category"
                                    pagination={false}
                                />

                                <div style={{ marginTop: '20px' }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={contentLengthStats}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="length_category" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="avg_views" fill="#8884d8" name="平均阅读量" />
                                            <Bar yAxisId="right" dataKey="completion_rate_est" fill="#82ca9d" name="完成率估计(%)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </TabPane>

                        <TabPane tab="部门分析" key="4">
                            <Row gutter={[16, 16]}>
                                {departmentStats.map(dept => (
                                    <Col span={8} key={dept.department}>
                                        <Card
                                            title={dept.department}
                                            extra={<span>{dept.employee_count}名员工</span>}
                                        >
                                            <Statistic
                                                title="文章数"
                                                value={dept.article_count}
                                                style={{ marginBottom: '12px' }}
                                            />
                                            <Statistic
                                                title="总阅读量"
                                                value={dept.total_views}
                                                style={{ marginBottom: '12px' }}
                                            />
                                            <Statistic
                                                title="质量评分"
                                                value={dept.avg_quality_score}
                                                precision={1}
                                                suffix="/5.0"
                                                style={{ marginBottom: '12px' }}
                                            />
                                            <Statistic
                                                title="原创比例"
                                                value={dept.original_ratio}
                                                suffix="%"
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </TabPane>

                        <TabPane tab="平台分析" key="5">
                            <Row gutter={[16, 16]}>
                                {platformStats.map(platform => (
                                    <Col span={8} key={platform.platform_name}>
                                        <Card
                                            title={platform.platform_name}
                                            extra={<span>{platform.platform_type.toUpperCase()}</span>}
                                        >
                                            <Statistic
                                                title="文章数"
                                                value={platform.article_count}
                                                style={{ marginBottom: '12px' }}
                                            />
                                            <Statistic
                                                title="平均阅读量"
                                                value={platform.avg_views}
                                                style={{ marginBottom: '12px' }}
                                            />
                                            <Statistic
                                                title="平均互动量"
                                                value={platform.avg_interactions}
                                                style={{ marginBottom: '12px' }}
                                            />
                                            <div>
                                                <strong>最佳主题：</strong> {platform.best_topics.join(', ')}
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </TabPane>

                        <TabPane tab="稿件来源分析" key="6">
                            {loading || !mediaSourceStats ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Empty description="数据加载中..." />
                                </div>
                            ) : (
                                <>
                                    <Card title="稿件来源分布" style={{ marginBottom: '16px' }}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={prepareMediaSourceChartData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={120}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {prepareMediaSourceChartData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Card>

                                    <Card title="员工稿件来源统计表">
                                        <Table
                                            dataSource={mediaSourceStats.employees}
                                            columns={getMediaSourceColumns(mediaSourceStats.media_sources)}
                                            rowKey="employee_id"
                                            scroll={{ x: 'max-content' }}
                                            pagination={false}
                                            summary={() => (
                                                <Table.Summary>
                                                    <Table.Summary.Row>
                                                        <Table.Summary.Cell index={0} colSpan={2}>
                                                            <strong>总计</strong>
                                                        </Table.Summary.Cell>
                                                        {mediaSourceStats.media_sources.map((source, index) => (
                                                            <Table.Summary.Cell index={index + 2} key={source}>
                                                                <strong>{mediaSourceStats.overall_stats[source]}</strong>
                                                            </Table.Summary.Cell>
                                                        ))}
                                                        <Table.Summary.Cell index={mediaSourceStats.media_sources.length + 2}>
                                                            <strong>{Object.values(mediaSourceStats.overall_stats).reduce((a, b) => a + b, 0)}</strong>
                                                        </Table.Summary.Cell>
                                                    </Table.Summary.Row>
                                                </Table.Summary>
                                            )}
                                        />
                                    </Card>
                                </>
                            )}
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default ArticleAnalysisDashboard; 
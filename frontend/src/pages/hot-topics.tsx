import React, { useState } from 'react';
import Head from 'next/head';

export default function HotTopics() {
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState([
    { 
      id: 1, 
      title: '两会热点话题分析', 
      source: '微博、抖音、知乎', 
      popularity: 98, 
      trend: 'up',
      keywords: ['两会', '政府工作报告', '民生', '经济发展']
    },
    { 
      id: 2, 
      title: '新能源汽车行业发展', 
      source: '头条、微信', 
      popularity: 87, 
      trend: 'up',
      keywords: ['电动车', '补贴政策', '充电桩', '智能驾驶']
    },
    { 
      id: 3, 
      title: '教育改革新政策', 
      source: '微信、知乎', 
      popularity: 85, 
      trend: 'stable',
      keywords: ['双减政策', '素质教育', '教育公平', '学生减负']
    },
    { 
      id: 4, 
      title: '人工智能应用新进展', 
      source: '微博、科技媒体', 
      popularity: 92, 
      trend: 'up',
      keywords: ['AIGC', '大模型', 'ChatGPT', '行业变革']
    },
    { 
      id: 5, 
      title: '冬奥会精彩回顾', 
      source: '各大视频平台', 
      popularity: 79, 
      trend: 'down',
      keywords: ['冰雪运动', '国家荣誉', '体育精神', '赛事盘点']
    }
  ]);

  // 模拟获取最新热点的函数
  const refreshTopics = () => {
    setIsLoading(true);
    setTimeout(() => {
      // 这里将来会实现真正的API请求
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <Head>
        <title>热点追踪系统 - 融媒体AI助手</title>
      </Head>
      
      <div className="page-container">
        <div className="page-header">
          <h1>热点追踪系统</h1>
          <p className="description">
            实时监控全网热点话题，提供细分领域的话题分析和热度趋势预测
          </p>
        </div>
        
        <div className="action-bar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="搜索热点话题..." />
          </div>
          
          <div className="filters">
            <select defaultValue="all" aria-label="选择平台过滤">
              <option value="all">全部平台</option>
              <option value="weibo">微博</option>
              <option value="douyin">抖音</option>
              <option value="wechat">微信</option>
              <option value="zhihu">知乎</option>
            </select>
            
            <select defaultValue="popularity" aria-label="选择排序方式">
              <option value="popularity">按热度排序</option>
              <option value="time">按时间排序</option>
              <option value="trend">按趋势排序</option>
            </select>
          </div>
          
          <button className="refresh-btn" onClick={refreshTopics} disabled={isLoading}>
            <i className={`fas fa-sync ${isLoading ? 'fa-spin' : ''}`}></i>
            {isLoading ? '刷新中...' : '刷新热点'}
          </button>
        </div>
        
        <div className="topics-list">
          {topics.map(topic => (
            <div key={topic.id} className="topic-card">
              <div className="topic-header">
                <h3>{topic.title}</h3>
                <div className={`trend-indicator ${topic.trend}`}>
                  <i className={`fas fa-arrow-${topic.trend === 'up' ? 'up' : topic.trend === 'down' ? 'down' : 'right'}`}></i>
                </div>
              </div>
              
              <div className="topic-meta">
                <span className="source">
                  <i className="fas fa-globe"></i> {topic.source}
                </span>
                <span className="popularity">
                  <i className="fas fa-fire"></i> 热度: {topic.popularity}
                </span>
              </div>
              
              <div className="topic-keywords">
                {topic.keywords.map(keyword => (
                  <span key={keyword} className="keyword">{keyword}</span>
                ))}
              </div>
              
              <div className="topic-actions">
                <button className="action-btn">
                  <i className="fas fa-chart-line"></i> 详细分析
                </button>
                <button className="action-btn">
                  <i className="fas fa-lightbulb"></i> 内容建议
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        h1 {
          font-size: 32px;
          color: #1e3a8a;
          margin-bottom: 16px;
        }
        
        .description {
          font-size: 16px;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .search-box {
          position: relative;
          flex: 1;
          min-width: 260px;
        }
        
        .search-box i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }
        
        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .search-box input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        
        .filters {
          display: flex;
          gap: 12px;
        }
        
        .filters select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
        }
        
        .refresh-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .refresh-btn:hover {
          background: #4338ca;
        }
        
        .refresh-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .topics-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        
        .topic-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .topic-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .topic-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .topic-header h3 {
          font-size: 18px;
          color: #1f2937;
          margin: 0;
          font-weight: 600;
        }
        
        .trend-indicator {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
        }
        
        .trend-indicator.up {
          background: #dcfce7;
          color: #15803d;
        }
        
        .trend-indicator.down {
          background: #fee2e2;
          color: #b91c1c;
        }
        
        .trend-indicator.stable {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .topic-meta {
          display: flex;
          justify-content: space-between;
          color: #6b7280;
          font-size: 13px;
        }
        
        .topic-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .topic-keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .keyword {
          background: #f3f4f6;
          color: #4b5563;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
        }
        
        .topic-actions {
          display: flex;
          gap: 12px;
          margin-top: auto;
        }
        
        .action-btn {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #4b5563;
          border-radius: 6px;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #1f2937;
        }
        
        @media (max-width: 640px) {
          .action-bar {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filters {
            width: 100%;
          }
          
          .filters select {
            flex: 1;
          }
          
          .refresh-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
} 
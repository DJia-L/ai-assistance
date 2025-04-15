import React, { useState } from 'react';
import Head from 'next/head';

export default function UserProfiling() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  // 示例用户画像数据
  const profiles = [
    {
      id: 1,
      name: '科技爱好者',
      icon: 'laptop-code',
      color: '#4f46e5',
      description: '对最新科技产品和技术发展有着浓厚兴趣，喜欢了解前沿科技动态',
      interests: ['人工智能', '智能设备', '科技新闻', '编程技术'],
      activeTime: '晚间20:00-23:00',
      platforms: ['微博', '知乎', 'B站'],
      contentPreference: '深度科技解析、产品评测视频',
      demographic: '25-40岁，男性为主，本科及以上学历'
    },
    {
      id: 2,
      name: '生活方式达人',
      icon: 'coffee',
      color: '#ec4899',
      description: '注重品质生活，关注美食、旅行、时尚与家居装饰等内容',
      interests: ['美食探店', '旅行攻略', '家居设计', '时尚穿搭'],
      activeTime: '中午12:00-13:00，晚间19:00-21:00',
      platforms: ['小红书', '抖音', '微信'],
      contentPreference: '短视频、图文分享、实用指南',
      demographic: '23-35岁，女性为主，城市白领'
    },
    {
      id: 3,
      name: '财经投资者',
      icon: 'chart-line',
      color: '#0891b2',
      description: '关注财经动态和投资机会，寻求财富增值和理财知识',
      interests: ['股票市场', '基金投资', '财经新闻', '经济分析'],
      activeTime: '工作日9:00-11:00，15:00-18:00',
      platforms: ['雪球', '东方财富', '财经媒体'],
      contentPreference: '市场分析、投资策略、专家观点',
      demographic: '30-55岁，男女比例均衡，高收入群体'
    }
  ];

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlatform(e.target.value);
  };

  return (
    <>
      <Head>
        <title>用户画像引擎 - 融媒体AI助手</title>
      </Head>
      
      <div className="page-container">
        <div className="page-header">
          <h1>用户画像引擎</h1>
          <p className="description">
            深度分析用户行为特征，构建精准用户画像，助力内容精准触达目标受众
          </p>
        </div>
        
        <div className="profile-dashboard">
          <div className="dashboard-sidebar">
            <h2>画像分析工具</h2>
            
            <div className="tool-section">
              <h3>平台筛选</h3>
              <select 
                value={selectedPlatform} 
                onChange={handlePlatformChange}
                className="platform-select"
                aria-label="选择平台"
              >
                <option value="all">全部平台</option>
                <option value="weibo">微博</option>
                <option value="wechat">微信</option>
                <option value="douyin">抖音</option>
                <option value="xiaohongshu">小红书</option>
                <option value="bilibili">B站</option>
              </select>
            </div>
            
            <div className="tool-section">
              <h3>分析维度</h3>
              <div className="dimension-options">
                <label className="dimension-option">
                  <input type="checkbox" defaultChecked />
                  <span>兴趣偏好</span>
                </label>
                <label className="dimension-option">
                  <input type="checkbox" defaultChecked />
                  <span>活跃时间</span>
                </label>
                <label className="dimension-option">
                  <input type="checkbox" defaultChecked />
                  <span>内容偏好</span>
                </label>
                <label className="dimension-option">
                  <input type="checkbox" defaultChecked />
                  <span>人口特征</span>
                </label>
                <label className="dimension-option">
                  <input type="checkbox" defaultChecked />
                  <span>互动行为</span>
                </label>
              </div>
            </div>
            
            <div className="tool-section">
              <h3>创建新画像</h3>
              <button className="create-btn">
                <i className="fas fa-plus"></i> 创建自定义画像
              </button>
            </div>
          </div>
          
          <div className="profiles-container">
            {profiles.map(profile => (
              <div key={profile.id} className="profile-card">
                <div className="profile-icon" style={{background: profile.color}}>
                  <i className={`fas fa-${profile.icon}`}></i>
                </div>
                
                <div className="profile-content">
                  <h3 className="profile-name">{profile.name}</h3>
                  <p className="profile-desc">{profile.description}</p>
                  
                  <div className="profile-detail">
                    <h4>兴趣偏好</h4>
                    <div className="tags">
                      {profile.interests.map(interest => (
                        <span key={interest} className="tag">{interest}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="profile-detail">
                    <h4>活跃平台</h4>
                    <div className="platform-list">
                      {profile.platforms.map(platform => (
                        <span key={platform} className="platform">{platform}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="profile-detail-grid">
                    <div>
                      <h4>活跃时间</h4>
                      <p>{profile.activeTime}</p>
                    </div>
                    <div>
                      <h4>人口特征</h4>
                      <p>{profile.demographic}</p>
                    </div>
                  </div>
                  
                  <div className="profile-detail">
                    <h4>内容偏好</h4>
                    <p>{profile.contentPreference}</p>
                  </div>
                  
                  <div className="profile-actions">
                    <button className="action-btn">
                      <i className="fas fa-chart-pie"></i> 详细分析
                    </button>
                    <button className="action-btn">
                      <i className="fas fa-bullseye"></i> 创建定向内容
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        
        .profile-dashboard {
          display: flex;
          gap: 30px;
        }
        
        .dashboard-sidebar {
          width: 280px;
          flex-shrink: 0;
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }
        
        .dashboard-sidebar h2 {
          font-size: 20px;
          color: #1f2937;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .tool-section {
          margin-bottom: 24px;
        }
        
        .tool-section h3 {
          font-size: 16px;
          color: #4b5563;
          margin: 0 0 12px 0;
          font-weight: 500;
        }
        
        .platform-select {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          font-size: 14px;
        }
        
        .dimension-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .dimension-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .dimension-option input {
          cursor: pointer;
        }
        
        .dimension-option span {
          font-size: 14px;
          color: #4b5563;
        }
        
        .create-btn {
          width: 100%;
          padding: 10px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .create-btn:hover {
          background: #4338ca;
        }
        
        .profiles-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .profile-card {
          display: flex;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
        }
        
        .profile-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .profile-icon {
          width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }
        
        .profile-content {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .profile-name {
          font-size: 20px;
          color: #1f2937;
          margin: 0;
          font-weight: 600;
        }
        
        .profile-desc {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        .profile-detail h4 {
          font-size: 14px;
          color: #4b5563;
          margin: 0 0 8px 0;
          font-weight: 500;
        }
        
        .profile-detail p {
          font-size: 14px;
          color: #1f2937;
          margin: 0;
        }
        
        .tags, .platform-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .tag {
          background: #f3f4f6;
          color: #4b5563;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
        }
        
        .platform {
          background: #e0e7ff;
          color: #4f46e5;
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
        }
        
        .profile-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .profile-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
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
        
        @media (max-width: 900px) {
          .profile-dashboard {
            flex-direction: column;
          }
          
          .dashboard-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
} 
import React from 'react';
import Head from 'next/head';

export default function DistributionStrategy() {
  return (
    <>
      <Head>
        <title>智能分发策略 - 融媒体AI助手</title>
      </Head>
      
      <div className="page-container">
        <div className="page-header">
          <h1>智能分发策略</h1>
          <p className="description">
            根据内容特点和平台算法推荐最佳发布时间、渠道和推广方式
          </p>
        </div>
        
        <div className="content-placeholder">
          <i className="fas fa-share-alt icon"></i>
          <h2>智能分发策略功能开发中</h2>
          <p>该功能模块即将上线，敬请期待！</p>
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
        
        .content-placeholder {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          padding: 80px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .icon {
          font-size: 64px;
          color: #d1d5db;
        }
        
        h2 {
          font-size: 24px;
          color: #4b5563;
          margin: 0;
        }
        
        p {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }
      `}</style>
    </>
  );
} 
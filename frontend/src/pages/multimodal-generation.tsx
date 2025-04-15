import React from 'react';
import Head from 'next/head';

export default function MultimodalGeneration() {
  return (
    <>
      <Head>
        <title>多模态生成引擎 - 融媒体AI助手</title>
      </Head>
      
      <div className="page-container">
        <div className="page-header">
          <h1>多模态生成引擎</h1>
          <p className="description">
            自动生成文本、图片、视频等多种形式内容，实现一键多形态内容创作
          </p>
        </div>
        
        <div className="content-placeholder">
          <i className="fas fa-images icon"></i>
          <h2>多模态生成引擎功能开发中</h2>
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
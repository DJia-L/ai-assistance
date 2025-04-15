import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ErrorPage() {
  const router = useRouter();
  const { message, code, back } = router.query;
  
  const errorCode = typeof code === 'string' ? code : '未知错误';
  const errorMessage = typeof message === 'string' ? message : '发生了一个错误，请稍后再试';
  const backUrl = typeof back === 'string' ? back : '/';
  
  return (
    <div className="error-page">
      <Head>
        <title>错误 - {errorCode}</title>
      </Head>
      
      <div className="error-container">
        <h1>出错了</h1>
        <div className="error-code">{errorCode}</div>
        <div className="error-message">{errorMessage}</div>
        
        <div className="error-actions">
          <button onClick={() => router.push(backUrl)}>返回</button>
          <button onClick={() => router.reload()}>刷新页面</button>
          <button onClick={() => router.push('/')}>回到首页</button>
        </div>
      </div>
      
      <style jsx>{`
        .error-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f7f8fa;
          padding: 20px;
        }
        
        .error-container {
          max-width: 500px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          padding: 40px;
          text-align: center;
        }
        
        h1 {
          margin-top: 0;
          color: #333;
          font-size: 28px;
        }
        
        .error-code {
          font-size: 48px;
          font-weight: bold;
          color: #e53935;
          margin: 20px 0;
        }
        
        .error-message {
          color: #666;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        
        .error-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        button {
          background-color: #1a73e8;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: #1557b0;
        }
      `}</style>
    </div>
  );
} 
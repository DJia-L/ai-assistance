import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 简单的表单验证
    if (!username || !email || !password || !confirmPassword) {
      setErrorMsg('请填写所有字段');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    
    // 这里应该是真实的注册逻辑，这里仅作演示
    // 模拟保存用户数据
    const userData = {
      name: username,
      email: email,
      avatar: '',
      id: Math.random().toString(36).substring(2, 9),
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // 重定向到首页
    router.push('/');
  };
  
  return (
    <>
      <Head>
        <title>用户注册 - AI Media Integration</title>
        <meta name="description" content="注册AI Media Integration账户" />
      </Head>
      
      <div className="register-page">
        <div className="register-container">
          <div className="register-header">
            <h1 className="gradient-text">创建账户</h1>
            <p>加入AI Media Integration平台</p>
          </div>
          
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="form-input"
              />
            </div>
            
            <div className="form-options">
              <label className="terms-agreement">
                <input type="checkbox" required /> 我同意<Link href="/terms" className="terms-link">服务条款</Link>和<Link href="/privacy" className="terms-link">隐私政策</Link>
              </label>
            </div>
            
            <button type="submit" className="submit-btn">注册</button>
            
            <div className="form-footer">
              <p>已有账户? <Link href="/login" className="login-link">立即登录</Link></p>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .register-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
          animation: fadeIn 0.6s ease-out;
        }
        
        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .register-header h1 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .gradient-text {
          background: linear-gradient(90deg, #4285F4, #34A853);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .register-header p {
          color: #666;
          font-size: 0.95rem;
        }
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.8rem;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #444;
        }
        
        .form-input {
          padding: 0.8rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .form-input:focus {
          border-color: #4285F4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
          outline: none;
        }
        
        .form-options {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
        }
        
        .terms-agreement {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #555;
        }
        
        .terms-link {
          color: #4285F4;
          text-decoration: none;
          transition: color 0.3s;
        }
        
        .terms-link:hover {
          color: #34A853;
          text-decoration: underline;
        }
        
        .submit-btn {
          background: linear-gradient(90deg, #4285F4, #34A853);
          color: white;
          border: none;
          padding: 0.9rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
        }
        
        .submit-btn:hover {
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
          transform: translateY(-2px);
        }
        
        .form-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .login-link {
          color: #4285F4;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }
        
        .login-link:hover {
          color: #34A853;
          text-decoration: underline;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 480px) {
          .register-container {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </>
  );
} 
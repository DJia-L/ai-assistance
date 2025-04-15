import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { login } from '../utils/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const formData = {
        emailOrUsername: username,
        password: password
      };
      
      const response = await login(formData);
      console.log('登录成功:', response);
      
      // 检查是否有重定向路径
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        // 默认重定向到首页
        router.push('/');
      }
    } catch (error) {
      console.error('登录错误:', error);
      setErrorMsg(error.message || '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>用户登录 - AI Media Integration</title>
        <meta name="description" content="登录到AI Media Integration系统" />
      </Head>
      
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1 className="gradient-text">欢迎回来</h1>
            <p>登录您的AI Media Integration账户</p>
          </div>
          
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
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
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> 记住我
              </label>
              <Link href="/forgot-password" className="forgot-password">忘记密码?</Link>
            </div>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>登录</button>
            
            <div className="form-footer">
              <p>还没有账户? <Link href="/register" className="register-link">立即注册</Link></p>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .login-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          animation: fadeIn 0.6s ease-out;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .login-header h1 {
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
        
        .login-header p {
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
        
        .login-form {
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
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }
        
        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #555;
        }
        
        .forgot-password {
          color: #4285F4;
          text-decoration: none;
          transition: color 0.3s;
        }
        
        .forgot-password:hover {
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
        
        .register-link {
          color: #4285F4;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }
        
        .register-link:hover {
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
          .login-container {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </>
  );
} 
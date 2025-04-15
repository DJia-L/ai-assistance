import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { isAuthenticated, getCurrentUser, logout } from '../utils/auth';
import { User } from '../types/user';
import { useRouter } from 'next/router';

export default function Home() {
  // 视频是否活跃的状态
  const [videoActive, setVideoActive] = useState(false);
  // 用户登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 当前用户信息
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // 用户菜单展开状态
  const [menuOpen, setMenuOpen] = useState(false);
  // 路由
  const router = useRouter();

  // 挂载后初始化视频和检查登录状态
  useEffect(() => {
    // 激活视频
    setTimeout(() => {
      setVideoActive(true);
    }, 500);

    // 检查用户登录状态
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const user = getCurrentUser();
      setCurrentUser(user);
    }

    // 加载字体图标库
    const script = document.createElement('script');
    script.src = 'https://kit.fontawesome.com/a076d05399.js';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 处理退出登录
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMenuOpen(false);
    router.reload();
  };

  // 切换菜单状态
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // 功能项数据 - 已移至全局侧边导航组件
  const features = [
    {
      icon: "fas fa-comment-dots",
      title: "AI对话",
      desc: "支持多种AI模型的语音和文本交互，包括DeepSeek通用AI对话能力、AI小融和AI小秘",
      link: "/chat"
    },
    {
      icon: "fas fa-file-alt",
      title: "稿件分析",
      desc: "统计媒体员工稿件产出数量、热度、传播值，各平台数据分析",
      link: "/article-analysis"
    },
    {
      icon: "fas fa-microphone-alt",
      title: "AI配音",
      desc: "根据用户音频训练AI自定义配音，生成自然流畅的语音内容",
      link: "/ai-dubbing"
    },
    {
      icon: "fas fa-map-marked-alt",
      title: "旅游娱乐导览",
      desc: "以可互动的3D地图模式展现地方旅游和娱乐资源",
      link: "/tourism-guide"
    },
    {
      icon: "fas fa-edit",
      title: "内容生产",
      desc: "文档内容生成、排版、校对工具，提高内容创作效率",
      link: "/smart-editing"
    }
  ];

  // 处理功能按钮点击
  const handleFeatureClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push(link);
    }
  };

    return (
    <>
      <Head>
        <title>融媒体AI助手系统</title>
        <meta name="description" content="基于DeepSeek大模型的融媒体助手系统，提供全方位的融媒体内容分析、生成与优化服务" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 这个样式块可以替换为单独的CSS文件 */}
      <style jsx global>{`
        /* 从index.html复制主要样式 */
        :root {
          --text-primary: rgba(255, 255, 255, 0.95);
          --text-secondary: rgba(255, 255, 255, 0.7);
          --accent: #3B82F6;
          --accent-2: #10B981;
          --light-bg: #fafafa;
          --card-bg: rgba(255, 255, 255, 0.15);
          --card-hover: rgba(255, 255, 255, 0.25);
          --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        html, body {
          height: 100%;
          font-size: 16px;
          scroll-behavior: smooth;
          background-color: #111;
          color: var(--text-primary);
          overflow-x: hidden;
        }

        /* 背景效果 */
        .background-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          overflow: hidden;
        }

        .video-background {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 105%;
          min-height: 105%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%) scale(1.05);
          object-fit: cover;
          filter: grayscale(0.1) contrast(1.1) brightness(1);
          transition: all 1.5s ease;
        }

        .video-background.active {
          filter: grayscale(0) contrast(1.15) brightness(1);
        }

        .vignette {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
          z-index: 1;
        }
        
        /* 主内容 */
        .main-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          z-index: 3;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          flex-direction: column;
          padding: 0 8vw;
        }

        /* 顶部导航 */
        .logo-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 10;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 0.5px;
          color: var(--text-primary);
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        .login-btn {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 6px 14px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        }
        
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
        }
        
        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        
        .user-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: rgba(30, 30, 30, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 6px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          z-index: 100;
          min-width: 120px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          opacity: 0;
          transform: translateY(-10px);
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .user-menu.open {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }
        
        .menu-item {
          padding: 10px 16px;
          color: var(--text-secondary);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
        
        .menu-item i {
          font-size: 12px;
        }
        
        /* 首页标题区域左对齐调整 */
        .header {
          padding: 4vh 0 8vh;
          width: 100%;
          max-width: 1400px;
          margin: 0 0;
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-left: 10px;
        }

        .title {
          font-size: 5.5vw;
          font-weight: 300;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -1px;
          color: var(--text-primary);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-align: left;
        }

        .title.pulse {
          transform: scale(1.02);
          text-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
        }

        .title-line {
          display: block;
          white-space: nowrap;
          margin-bottom: 0.2em;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .title .highlight {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          font-weight: 500;
          position: relative;
          white-space: nowrap;
          text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          to {
            text-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }

        .subtitle {
          font-size: 1rem;
          font-weight: 300;
          color: var(--text-secondary);
          margin-top: 1.5rem;
          line-height: 1.6;
          max-width: 550px;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .subtitle.pulse {
          transform: scale(1.05);
          color: var(--text-primary);
        }

        /* 功能展示区 */
        .features-wrapper {
          width: 100%;
          max-width: 1700px;
          margin-bottom: 5vh;
        }

        .features-grid {
          display: grid;
          /* 移动设备：自动填充，每个卡片至少240px宽 */
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
          width: 100%;
        }

        /* 平板设备 */
        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }

        /* 小型桌面设备 */
        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }
        }

        /* 大型桌面设备 - 强制每行5个 */
        @media (min-width: 1280px) {
          .features-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 2rem;
          }
        }

        .feature-item {
          position: relative;
          aspect-ratio: 1.6 / 1;
          min-height: 200px;
          background-color: var(--card-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.5s var(--transition-smooth);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
        }

        .feature-item:hover {
          background-color: var(--card-hover);
          transform: translateY(-5px);
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.08);
        }

        .feature-item:hover .feature-icon {
          transform: scale(1.1);
          color: var(--accent);
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          transition: transform 0.5s var(--transition-smooth), color 0.5s var(--transition-smooth);
          transition-delay: 0.05s;
          color: var(--accent);
        }

        .feature-title {
          font-size: 1.4rem;
          font-weight: 400;
          margin-bottom: 0.8rem;
          color: var(--text-primary);
        }

        .feature-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          opacity: 0.8;
          max-width: 90%;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--text-primary);
          text-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }
        
        .logo-normal {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: glow 2s ease-in-out infinite alternate;
        }

        .logo-highlight {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
          animation: glow 2s ease-in-out infinite alternate;
        }

        .logo-subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 4px;
          letter-spacing: 0.5px;
        }

        /* 隐藏首页特定的导航 */
        .dial-navigation {
          display: none;
        }

        @media (max-width: 1200px) {
          .main-container {
            padding: 0 4vw;
          }

          .title {
            font-size: 8vw;
          }
          
          .header {
            padding: 3vh 0 8vh;
            padding-left: 8px;
          }
          
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(4, 1fr);
          }
        }

        @media (max-width: 768px) {
          .main-container {
            padding: 0 3vw;
          }

          .title {
            font-size: 11vw;
          }

          .subtitle {
            font-size: 1rem;
          }

          .logo {
            top: 20px;
            left: 20px;
          }
          
          .header {
            padding: 2vh 0 8vh;
            padding-left: 6px;
          }
          
          .scroll-down {
            bottom: 20px;
            right: 20px;
          }

          .feature-item {
            min-height: 180px;
            padding: 1.5rem;
          }

          .feature-title {
            font-size: 1.2rem;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(5, 1fr);
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 12vh 0 6vh;
            padding-left: 10px;
          }

          .title {
            font-size: 12vw;
          }

          .subtitle {
            font-size: 0.9rem;
            margin-top: 1rem;
          }

          .feature-item {
            min-height: 150px;
            padding: 1.2rem;
          }

          .feature-icon {
            font-size: 1.5rem;
          }

          .feature-title {
            font-size: 1.1rem;
          }

          .feature-desc {
            font-size: 0.8rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(10, 1fr);
          }
        }

        /* 功能按钮区域 */
        .feature-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 3rem;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.6s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-button {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(16px);
          padding: 16px 24px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .feature-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2));
          opacity: 0;
          transition: opacity 0.8s ease;
        }

        .feature-button:hover {
          transform: translateY(-6px) scale(1.02);
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15), 
                      0 0 20px rgba(59, 130, 246, 0.2);
        }

        .feature-button:hover::before {
          opacity: 1;
        }

        .feature-button:hover .feature-button-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
        }

        .feature-button:hover .feature-button-text {
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
          letter-spacing: 0.5px;
        }

        .feature-button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          border-radius: 50%;
          color: white;
          font-size: 20px;
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          position: relative;
          z-index: 1;
        }

        .feature-button-icon::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          z-index: -1;
          opacity: 0.5;
          filter: blur(4px);
        }

        .feature-button-text {
          font-size: 17px;
          font-weight: 500;
          color: var(--text-primary);
          transition: all 0.5s ease;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 768px) {
          .feature-buttons {
            margin-top: 2.5rem;
            gap: 14px;
          }
          
          .feature-button {
            padding: 12px 20px;
            border-radius: 14px;
          }
          
          .feature-button-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }
          
          .feature-button-text {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .feature-buttons {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }
          
          .feature-button {
            width: 100%;
            justify-content: flex-start;
            padding: 14px 18px;
          }
          
          .feature-button:nth-child(1) {
            animation-delay: 0.6s;
          }
          .feature-button:nth-child(2) {
            animation-delay: 0.7s;
          }
          .feature-button:nth-child(3) {
            animation-delay: 0.8s;
          }
          .feature-button:nth-child(4) {
            animation-delay: 0.9s;
          }
          .feature-button:nth-child(5) {
            animation-delay: 1s;
          }
        }
      `}</style>

      {/* 背景容器 */}
      <div className="background-container">
        <video
          className={`video-background ${videoActive ? 'active' : ''}`}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/ai-background.mp4" type="video/mp4" />
        </video>
        <div className="vignette"></div>
      </div>
      
      {/* 主内容 */}
      <div className="main-container">
        <header className="header" id="header">
          <h1 className="title" id="title">
            <span className="title-line">基于<span className="highlight">DeepSeek</span>大模型的</span>
            <span className="title-line">融媒体<span className="highlight">AI</span>助手系统</span>
          </h1>
          <p className="subtitle" id="subtitle">
            提供全方位的融媒体内容分析、生成与优化服务，打造智能化媒体工作流
          </p>
          
          <div className="feature-buttons">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={(e) => handleFeatureClick(e, feature.link)}
                className={`feature-button feature-button-${index + 1}`}
                style={{animationDelay: `${0.6 + index * 0.1}s`}}
              >
                <div className="feature-button-icon">
                  <i className={feature.icon}></i>
                </div>
                <span className="feature-button-text">{feature.title}</span>
              </div>
            ))}
          </div>
        </header>
        </div>
    </>
    );
} 
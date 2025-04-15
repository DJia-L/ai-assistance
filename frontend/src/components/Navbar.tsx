import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface NavItem {
  path: string;
  label: string;
  symbol: string;
}

// 核心功能导航项
const coreNavItems: NavItem[] = [
  { path: '/chat', label: 'AI对话', symbol: '🎤' },
  { path: '/article-analysis', label: '稿件分析', symbol: '📄' },
  { path: '/ai-dubbing', label: 'AI配音', symbol: '🔊' },
  { path: '/tourism-guide', label: '旅游导览', symbol: '🌍' },
  { path: '/smart-editing', label: '内容生产', symbol: '✏️' },
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 选择器相关
  const navbarRef = useRef<HTMLUListElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLLIElement[]>([]);
  
  // 从本地存储加载用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);
  
  // 更新选择器位置
  const updateSelector = () => {
    const activeNavItem = navItemsRef.current.find((item, index) => 
      coreNavItems[index].path === router.pathname
    );
    
    if (!activeNavItem || !selectorRef.current) return;
    
    const { offsetLeft, offsetWidth } = activeNavItem;
    
    selectorRef.current.style.left = `${offsetLeft}px`;
    selectorRef.current.style.width = `${offsetWidth}px`;
    selectorRef.current.style.opacity = '1';
  };
  
  // 当路由变化或组件挂载时更新选择器
  useEffect(() => {
    // 等待DOM完全渲染
    setTimeout(() => {
      updateSelector();
    }, 50);
  }, [router.pathname]);
  
  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      updateSelector();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 点击页面其他区域时关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-profile') && !target.closest('.dropdown-menu')) {
        setShowDropdown(false);
      }
      if (!target.closest('.navbar-nav') && !target.closest('.navbar-toggler')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  // 设置导航项ref
  const setNavItemRef = (el: HTMLLIElement | null, index: number) => {
    if (el) {
      navItemsRef.current[index] = el;
    }
  };

  return (
    <nav className="navbar-mainbg">
      <div className="navbar-container">
        {/* Logo区域 */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">融媒体AI助手</span>
        </Link>
        
        {/* 移动端菜单按钮 */}
        <button 
          className={`navbar-toggler ${mobileMenuOpen ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          aria-label="切换导航菜单"
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
        
        {/* 导航区域 */}
        <div className={`navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav" ref={navbarRef}>
            {/* 背景选择器 */}
            <div className="nav-selector" ref={selectorRef}></div>
            
            {/* 导航项 */}
            {coreNavItems.map((item, index) => (
              <li 
                key={item.path} 
                className={`nav-item ${router.pathname === item.path ? 'active' : ''}`}
                ref={(el) => setNavItemRef(el, index)}
              >
                <Link href={item.path} className="nav-link">
                  <span className="nav-icon">{item.symbol}</span>
                  <span className="nav-text">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* 用户区域 */}
          <div className="user-area">
            <Link href="/settings" className="settings-btn">
              <span className="settings-icon">⚙️</span>
              <span className="settings-text">设置</span>
            </Link>
            
            <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="avatar">
                {user?.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt="用户头像" 
                    width={36} 
                    height={36}
                    className="avatar-img"
                  />
                ) : (
                  <div className="default-avatar">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <span className="username">{user?.username || '用户'}</span>
              <span className="dropdown-arrow">▼</span>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <strong>已登录为</strong>
                  <div className="dropdown-username">{user?.username || '用户'}</div>
                </div>
                <div className="dropdown-divider"></div>
                <Link href="/settings" className="dropdown-item">
                  <span className="dropdown-icon">⚙️</span>
                  <span>设置</span>
                </Link>
                <Link href="/my-knowledge" className="dropdown-item">
                  <span className="dropdown-icon">📚</span>
                  <span>我的知识库</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <span className="dropdown-icon">🚪</span>
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* 导航栏基础样式 */
        .navbar-mainbg {
          background-color: #5161ce;
          padding: 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          border-bottom: none;
          height: 60px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 60px;
          max-width: 1440px;
          margin: 0 auto;
        }

        /* Logo样式 */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          font-size: 18px;
          padding: 15px 0;
        }

        .logo-icon {
          font-size: 24px;
        }

        /* 导航折叠区域 */
        .navbar-collapse {
          display: flex;
          flex: 1;
          justify-content: space-between;
          align-items: center;
          margin-left: 20px;
          position: relative;
        }

        /* 导航菜单 */
        .navbar-nav {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          position: relative;
          height: 100%;
        }
        
        /* 选择器样式 */
        .nav-selector {
          position: absolute;
          height: 40px;
          background-color: white;
          border-radius: 20px;
          opacity: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          z-index: 0;
          top: 10px;
          transition: left 0.5s cubic-bezier(0.770, 0.000, 0.175, 1.000), 
                      width 0.5s cubic-bezier(0.770, 0.000, 0.175, 1.000),
                      opacity 0.5s ease;
        }

        /* 导航项目 */
        .nav-item {
          padding: 0 5px;
          margin: 0 5px;
          height: 60px;
          display: flex;
          align-items: center;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }

        .nav-link {
          text-decoration: none;
          font-size: 15px;
          display: flex;
          align-items: center;
          padding: 10px 15px;
          border-radius: 20px;
          transition: all 0.3s ease;
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.85);
          z-index: 2;
          position: relative;
        }

        .nav-icon {
          margin-right: 8px;
          font-size: 20px;
        }

        /* 激活状态 */
        .nav-item.active .nav-link {
          color: #5161ce;
          font-weight: 500;
          transition-delay: 0.1s;
        }

        /* 悬停效果 */
        .nav-item:not(.active):hover .nav-link {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
        }

        /* 用户区域 */
        .user-area {
          display: flex;
          align-items: center;
          gap: 15px;
          z-index: 2;
        }

        .settings-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 14px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .settings-btn:hover {
          color: #fff;
          background-color: rgba(255, 255, 255, 0.1);
        }

        .settings-icon {
          font-size: 16px;
        }

        /* 用户资料 */
        .user-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
        }

        .user-profile:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.4);
        }

        .default-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #8594e4, #6a75ca);
          color: white;
          font-weight: bold;
          font-size: 16px;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .username {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .dropdown-arrow {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-left: 3px;
        }

        /* 下拉菜单 */
        .dropdown-menu {
          position: absolute;
          top: 60px;
          right: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          padding: 8px;
          border: 1px solid #e5e7eb;
          z-index: 1001;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 10px 14px 6px;
          color: #6b7280;
          font-size: 12px;
        }

        .dropdown-username {
          color: #1f2937;
          font-size: 14px;
          font-weight: 500;
          margin-top: 3px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          color: #4b5563;
          text-decoration: none;
          font-size: 14px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .dropdown-icon {
          font-size: 15px;
        }

        .dropdown-item:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .logout-btn {
          color: #ef4444;
        }

        .logout-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .dropdown-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 6px 0;
        }

        /* 汉堡菜单按钮 */
        .navbar-toggler {
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 10px;
          z-index: 10;
        }

        .hamburger-icon {
          width: 25px;
          height: 20px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger-icon span {
          display: block;
          width: 100%;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .navbar-toggler.active .hamburger-icon span:nth-child(1) {
          transform: translateY(9px) rotate(45deg);
        }

        .navbar-toggler.active .hamburger-icon span:nth-child(2) {
          opacity: 0;
        }

        .navbar-toggler.active .hamburger-icon span:nth-child(3) {
          transform: translateY(-9px) rotate(-45deg);
        }

        /* 响应式设计 */
        @media (max-width: 991px) {
          .navbar-container {
            height: 60px;
          }
          
          .navbar-toggler {
            display: block;
          }
          
          .navbar-collapse {
            position: fixed;
            top: 60px;
            left: -100%;
            right: 0;
            bottom: 0;
            width: 300px;
            flex-direction: column;
            align-items: flex-start;
            background: #5161ce;
            box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
            transition: left 0.3s ease;
            margin-left: 0;
            z-index: 999;
            padding: 20px 0;
            overflow-y: auto;
          }
          
          .navbar-collapse.show {
            left: 0;
          }
          
          .navbar-nav {
            flex-direction: column;
            width: 100%;
          }
          
          .nav-item {
            width: 100%;
            float: none;
            height: auto;
            padding: 0;
            margin: 0;
          }
          
          .nav-link {
            padding: 12px 30px;
            width: 100%;
            border-radius: 0;
          }
          
          .nav-selector {
            display: none !important;
          }
          
          .nav-item.active .nav-link {
            background-color: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            box-shadow: none;
            border-radius: 0;
          }
          
          .user-area {
            flex-direction: column;
            width: 100%;
            padding: 15px 30px;
            gap: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 10px;
          }
          
          .dropdown-menu {
            position: relative;
            top: 10px;
            right: 0;
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .logo-text {
            display: none;
          }
          
          .settings-text {
            display: none;
          }
          
          .navbar-container {
            padding: 0 15px;
          }
        }
      `}</style>
    </nav>
  );
}
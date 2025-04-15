import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function ImmersiveNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const userAvatarRef = useRef(null);

  // 从本地存储加载用户信息
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const loadUserInfo = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    setIsLoaded(true);
    loadUserInfo();

    // 监听路由变化时重新加载用户信息
    router.events.on('routeChangeComplete', loadUserInfo);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      router.events.off('routeChangeComplete', loadUserInfo);
    };
  }, [router.events]);

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <>
      <style jsx global>{`
        .nav-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          background: ${isHomePage 
            ? `rgba(255, 255, 255, ${isScrolled ? '0.4' : '0.05'})` 
            : `rgba(255, 255, 255, ${isScrolled ? '0.9' : '0.7'})`};
          backdrop-filter: blur(${isScrolled ? '8px' : '3px'});
          box-shadow: ${isScrolled 
            ? '0 1px 8px rgba(0, 0, 0, 0.02)' 
            : 'none'};
          height: ${isScrolled ? '60px' : '70px'};
        }

        .logo-container {
          position: absolute;
          top: 50%;
          left: 8vw;
          z-index: 2000;
          transform: translateY(-50%);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 1200px) {
          .logo-container {
            left: 4vw;
          }
        }

        @media (max-width: 768px) {
          .logo-container {
            left: 3vw;
          }
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          text-decoration: none;
          position: relative;
          padding: 0.3rem 0.8rem;
          margin: 0;
          background: transparent;
          border-radius: 8px;
          box-shadow: none;
          border: none;
          opacity: ${isLoaded ? '1' : '0'};
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .logo-text {
          font-size: ${isScrolled ? '1rem' : '1.1rem'};
          font-weight: 600;
          background: linear-gradient(90deg, #4285F4, #34A853);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          animation: deepseekGlow 2s ease-in-out infinite alternate;
          letter-spacing: 0.02em;
        }

        .nav-content {
          max-width: 1440px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }

        .logo::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, var(--accent), var(--accent-2));
          border-radius: 8px;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
          z-index: -1;
        }

        .logo:hover::before {
          opacity: 0.1;
          transform: scale(1);
        }

        .logo-icon {
          width: ${isScrolled ? '22px' : '24px'};
          height: ${isScrolled ? '22px' : '24px'};
          stroke: currentColor;
          stroke-width: 1.5;
          fill: none;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-links {
          display: flex;
          gap: 24px;
          align-items: center;
          margin: 0 auto;
        }

        .nav-link {
          text-decoration: none !important;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: ${isHomePage ? 'rgba(255, 255, 255, 0.85)' : 'rgba(50, 50, 50, 0.85)'};
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
        }

        .nav-link:hover {
          color: transparent;
          background: linear-gradient(90deg, #4285F4, #34A853);
          -webkit-background-clip: text;
          background-clip: text;
          transform: translateY(-2px);
          text-shadow: 0 0 20px rgba(66, 133, 244, 0.4);
          animation: deepseekGlow 2s ease-in-out infinite alternate;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg, #4285F4, #34A853);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
        }

        .nav-link:hover::after {
          transform: scaleX(1);
          opacity: 1;
        }

        .active {
          position: relative;
          color: transparent;
          background: linear-gradient(90deg, #4285F4, #34A853);
          -webkit-background-clip: text;
          background-clip: text;
          font-weight: 600;
          animation: deepseekGlow 2s ease-in-out infinite alternate;
        }

        .active::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg, #4285F4, #34A853);
          transform: scaleX(1);
          box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
          animation: lineGlow 2s ease-in-out infinite alternate;
        }

        @keyframes lineGlow {
          0% {
            box-shadow: 0 0 5px rgba(66, 133, 244, 0.3);
          }
          100% {
            box-shadow: 0 0 15px rgba(52, 168, 83, 0.6);
          }
        }

        @keyframes navIndicator {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @keyframes deepseekGlow {
          0% {
            text-shadow: 0 0 20px rgba(66, 133, 244, 0.4);
          }
          100% {
            text-shadow: 0 0 35px rgba(52, 168, 83, 0.7);
          }
        }

        @keyframes whiteglow {
          0% {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }
          100% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          }
        }

        @media (max-width: 1200px) {
          .nav-content {
            padding-left: 4vw;
            padding-right: 4vw;
          }
        }

        @media (max-width: 768px) {
          .nav-content {
            padding-left: 3vw;
            padding-right: 3vw;
            padding: ${isScrolled ? '0.3rem 0' : '0.5rem 0'};
          }

          .nav-links {
            gap: 1rem;
          }

          .nav-link {
            font-size: 0.85rem;
            padding: 0.25rem 0.5rem;
          }

          .logo-text {
            font-size: ${isScrolled ? '0.95rem' : '1rem'};
          }
        }
        
        /* 防止导航栏遮挡内容 */
        .main-container, 
        .content-container, 
        .page-content, 
        main:not(.home-page-container) {
          padding-top: ${isScrolled ? '50px' : '60px'};
        }
        
        @media (max-width: 768px) {
          .main-container, 
          .content-container, 
          .page-content, 
          main:not(.home-page-container) {
            padding-top: ${isScrolled ? '40px' : '48px'};
          }
        }

        /* 用户操作区域样式 */
        .user-actions {
          display: flex;
          align-items: center;
          margin-left: 2rem;
        }

        .icon-button {
          background: transparent;
          border: none;
          color: ${isHomePage ? 'rgba(255, 255, 255, 0.85)' : 'rgba(50, 50, 50, 0.85)'};
          font-size: 1.1rem;
          padding: 0.3rem;
          border-radius: 50%;
          cursor: pointer;
          margin-right: 1rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }

        .icon-button:hover {
          background: rgba(66, 133, 244, 0.1);
          color: #4285F4;
          transform: translateY(-2px);
        }

        .user-avatar-container {
          position: relative;
          display: flex;
          align-items: center;
          padding-right: 30px;
          margin-right: -30px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4285F4, #34A853);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-avatar:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .logout-button {
          position: absolute;
          right: -5px;
          top: 50%;
          transform: translateY(-50%) scale(0);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7f8c8d, #95a5a6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 8px;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1.5px solid white;
        }

        .user-avatar-container:hover .logout-button {
          opacity: 1;
          transform: translateY(-50%) scale(1);
        }
        
        .logout-button:hover {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          transform: translateY(-50%) scale(1.2);
        }

        .login-btn {
          background: linear-gradient(90deg, #4285F4, #34A853);
          color: white;
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
        }

        @media (max-width: 768px) {
          .user-actions {
            margin-left: 1rem;
          }
          
          .icon-button {
            margin-right: 0.5rem;
            width: 28px;
            height: 28px;
          }
          
          .user-avatar {
            width: 28px;
            height: 28px;
            font-size: 0.7rem;
          }
          
          .login-btn {
            padding: 0.3rem 0.8rem;
            font-size: 0.75rem;
          }
        }

        .user-area {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          margin-left: auto;
        }

        .settings-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: ${isHomePage ? 'rgba(255, 255, 255, 0.85)' : 'rgba(50, 50, 50, 0.85)'};
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .settings-btn:hover {
          background: ${isHomePage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        }

        .settings-icon {
          font-size: 1.1rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-profile:hover {
          background: ${isHomePage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
          transform: translateY(-1px);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .avatar-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
        }

        .default-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          background: linear-gradient(135deg, #4285F4, #34A853);
          border-radius: 50%;
          text-transform: uppercase;
        }

        .username {
          color: ${isHomePage ? '#fff' : '#333'};
          font-size: 0.9rem;
          font-weight: 500;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          font-size: 0.7rem;
          color: ${isHomePage ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
          margin-left: 4px;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          padding: 8px;
          z-index: 1000;
          animation: dropdownFadeIn 0.2s ease-out;
        }

        .dropdown-header {
          padding: 8px 12px;
        }

        .dropdown-header strong {
          font-size: 0.8rem;
          color: #666;
        }

        .dropdown-username {
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
          margin-top: 2px;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 4px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          color: #333;
          text-decoration: none;
          font-size: 0.9rem;
          border-radius: 4px;
          transition: all 0.2s ease;
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }

        .dropdown-item:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .dropdown-icon {
          font-size: 1.1rem;
        }

        .logout-btn {
          color: #dc3545;
        }

        .logout-btn:hover {
          background: #fff5f5;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .nav-content {
            padding: 0 16px;
          }

          .nav-links {
            display: none;
          }

          .settings-text {
            display: none;
          }

          .username {
            display: none;
          }

          .user-area {
            gap: 8px;
          }

          .user-profile {
            padding: 4px;
          }

          .dropdown-menu {
            right: -8px;
          }
        }
      `}</style>

      <nav className={`nav-container ${isLoaded ? 'loaded' : ''} ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo-container">
            <Link href="/" className="logo">
              <span className="logo-text">AI Media Integration</span>
            </Link>
          </div>

          <div className="nav-links">
            <Link href="/chat" className={`nav-link ${router.pathname === '/chat' ? 'active' : ''}`}>
              AI对话
            </Link>
            <Link href="/article-analysis" className={`nav-link ${router.pathname === '/article-analysis' ? 'active' : ''}`}>
              稿件分析
            </Link>
            <Link href="/ai-dubbing" className={`nav-link ${router.pathname === '/ai-dubbing' ? 'active' : ''}`}>
              AI配音
            </Link>
            <Link href="/tourism-guide" className={`nav-link ${router.pathname === '/tourism-guide' ? 'active' : ''}`}>
              旅游导览
            </Link>
            <Link href="/smart-editing" className={`nav-link ${router.pathname === '/smart-editing' ? 'active' : ''}`}>
              内容生产
            </Link>
          </div>

          <div className="user-area">
            {user ? (
              <>
                <Link href="/settings" className="settings-btn">
                  <span className="settings-icon">⚙️</span>
                  <span className="settings-text">设置</span>
                </Link>
                
                <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                  <div className="avatar">
                    {user.avatar ? (
                      <Image 
                        src={user.avatar}
                        alt={`${user.username || '用户'}的头像`}
                        width={32}
                        height={32}
                        className="avatar-img"
                        onError={(e: any) => {
                          const target = e.target as HTMLImageElement;
                          if (target.parentNode) {
                            // 移除所有已存在的默认头像
                            const existingAvatars = target.parentNode.querySelectorAll('.default-avatar');
                            existingAvatars.forEach(avatar => avatar.remove());
                            
                            // 创建新的默认头像
                            const defaultAvatar = document.createElement('div');
                            defaultAvatar.className = 'default-avatar';
                            defaultAvatar.innerText = user.username ? user.username.charAt(0).toUpperCase() : 'U';
                            target.parentNode.appendChild(defaultAvatar);
                          }
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="default-avatar">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <span className="username">{user.username || '用户'}</span>
                  <span className="dropdown-arrow">▼</span>
                </div>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <strong>已登录为</strong>
                      <div className="dropdown-username">{user.username || '用户'}</div>
                    </div>
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
              </>
            ) : (
              <Link href="/login" className="login-btn">
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
} 
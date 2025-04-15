import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import gsap from 'gsap';

// 导航项数据
const navItems = [
  {
    icon: "fas fa-comment-dots",
    title: "AI对话",
    link: "/chat"
  },
  {
    icon: "fas fa-file-alt",
    title: "稿件分析",
    link: "/article-analysis"
  },
  {
    icon: "fas fa-microphone-alt",
    title: "AI配音",
    link: "/ai-dubbing"
  },
  {
    icon: "fas fa-map-marked-alt",
    title: "旅游导览",
    link: "/tourism-guide"
  },
  {
    icon: "fas fa-edit",
    title: "内容生产",
    link: "/smart-editing"
  }
];

const SideNav: React.FC = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  // 初始化GSAP动画
  useEffect(() => {
    // 创建初始动画效果
    gsap.set(itemsRef.current.map(item => item?.querySelector('.nav-icon')), { 
      scale: 1,
      rotation: 0,
      y: 0,
      opacity: 0.7
    });
    
    // 找到当前活动的导航项
    const currentIndex = navItems.findIndex(item => item.link === router.pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
      // 设置当前活动项的初始状态
      const activeItem = itemsRef.current[currentIndex];
      if (activeItem) {
        const icon = activeItem.querySelector('.nav-icon');
        gsap.to(icon, { 
          opacity: 1,
          scale: 1.1,
          rotation: 0,
          duration: 0.6,
          ease: "power2.out"
        });
      }
    }
  }, [router.pathname]);

  // 当活动索引变化时更新指示器
  useEffect(() => {
    if (activeIndex !== null && indicatorRef.current) {
      const activeItem = itemsRef.current[activeIndex];
      if (activeItem) {
        const rect = activeItem.getBoundingClientRect();
        const navRect = navRef.current?.getBoundingClientRect();
        
        if (navRect) {
          const top = rect.top - navRect.top;
          
          gsap.to(indicatorRef.current, {
            y: top,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out"
          });
        }
      }
    }
  }, [activeIndex]);

  // 处理导航项悬停
  const handleItemHover = (index: number) => {
    setIsHovering(true);
    
    // 为所有非活动项添加悬停效果
    itemsRef.current.forEach((item, i) => {
      if (i !== activeIndex) {
        const icon = item?.querySelector('.nav-icon');
        const text = item?.querySelector('.nav-text');
        
        if (i === index) {
          // 当前悬停项
          gsap.to(icon, { 
            opacity: 0.9, 
            scale: 1.15, 
            rotation: 0, 
            duration: 0.4,
            ease: "power2.out"
          });
          gsap.to(text, { 
            opacity: 1, 
            x: 0, 
            duration: 0.4,
            ease: "power2.out"
          });
        } else {
          // 其他项淡出
          gsap.to(icon, { 
            opacity: 0.4, 
            scale: 0.95, 
            duration: 0.4,
            ease: "power2.out"
          });
        }
      }
    });
  };

  // 处理导航项离开悬停
  const handleItemLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    
    hoverTimer.current = setTimeout(() => {
      setIsHovering(false);
      
      // 重置所有项的样式
      itemsRef.current.forEach((item, i) => {
        const icon = item?.querySelector('.nav-icon');
        const text = item?.querySelector('.nav-text');
        
        if (i === activeIndex) {
          // 活动项
          gsap.to(icon, { 
            opacity: 1, 
            scale: 1.1, 
            rotation: 0, 
            duration: 0.4,
            ease: "power2.out"
          });
        } else {
          // 非活动项
          gsap.to(icon, { 
            opacity: 0.7, 
            scale: 1, 
            rotation: 0, 
            duration: 0.4,
            ease: "power2.out"
          });
          gsap.to(text, { 
            opacity: 0, 
            x: -10, 
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    }, 100);
  };

  return (
    <div 
      className="nav-container"
      ref={navRef}
      onMouseEnter={() => gsap.to(navRef.current, { width: '240px', duration: 0.5, ease: "power3.out" })}
      onMouseLeave={() => gsap.to(navRef.current, { width: '80px', duration: 0.5, ease: "power3.out" })}
    >
      <div className="nav-bg-blur"></div>
      <div className="nav-content">
        <Link href="/" className="nav-logo">
          <div className="logo-icon">
            <i className="fas fa-home"></i>
          </div>
          <span className="logo-text">首页</span>
        </Link>
        
        <div className="nav-separator"></div>
        
        <div className="nav-list">
          <div className="nav-indicator" ref={indicatorRef}></div>
          
          {navItems.map((item, index) => {
            const isActive = router.pathname === item.link;
            
            return (
              <Link 
                href={item.link} 
                key={index}
                className={`nav-item ${isActive ? 'active' : ''}`}
                ref={el => itemsRef.current[index] = el}
                onMouseEnter={() => handleItemHover(index)}
                onMouseLeave={handleItemLeave}
              >
                <div className="nav-icon">
                  <i className={item.icon}></i>
                  <div className="nav-icon-glow"></div>
                </div>
                <span className="nav-text">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .nav-container {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 80px;
          z-index: 1000;
          transition: width 0.5s cubic-bezier(0.65, 0, 0.35, 1);
          overflow: hidden;
        }
        
        .nav-bg-blur {
          position: absolute;
          inset: 0;
          background: rgba(14, 20, 33, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          z-index: -1;
        }
        
        .nav-content {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 32px 0;
          z-index: 1;
        }
        
        .nav-logo {
          display: flex;
          align-items: center;
          padding: 0 24px;
          text-decoration: none;
          margin-bottom: 40px;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .logo-icon:before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
          z-index: 0;
        }
        
        .logo-icon i {
          color: white;
          font-size: 18px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
        
        .logo-text {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-left: 16px;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.4s ease;
          white-space: nowrap;
        }
        
        .nav-container:hover .logo-text {
          opacity: 1;
          transform: translateX(0);
        }
        
        .nav-separator {
          height: 1px;
          background: linear-gradient(to right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          margin: 0 16px 32px;
        }
        
        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          padding: 0 20px;
        }
        
        .nav-indicator {
          position: absolute;
          left: 0;
          width: 3px;
          height: 40px;
          background: linear-gradient(to bottom, #3B82F6, #2563EB);
          border-radius: 0 4px 4px 0;
          opacity: 0;
          pointer-events: none;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          z-index: 0;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .nav-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          position: relative;
          flex-shrink: 0;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        
        .nav-icon-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease;
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
        }
        
        .nav-item:hover .nav-icon-glow,
        .nav-item.active .nav-icon-glow {
          opacity: 1;
        }
        
        .nav-item.active .nav-icon {
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          color: white;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
        }
        
        .nav-text {
          font-size: 15px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          margin-left: 16px;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .nav-container:hover .nav-text {
          opacity: 0.8;
          transform: translateX(0);
        }
        
        .nav-item.active .nav-text {
          color: white;
          font-weight: 600;
        }
        
        /* 响应式调整 */
        @media (max-width: 768px) {
          .nav-container,
          .nav-container:hover {
            width: 70px;
          }
          
          .nav-container:hover .nav-text,
          .nav-container:hover .logo-text {
            opacity: 0;
          }
          
          .logo-icon,
          .nav-icon {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
          
          .nav-list {
            padding: 0 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default SideNav;
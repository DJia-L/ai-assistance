import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
  linkToHome?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showSubtitle = true,
  linkToHome = true,
  className = '',
}) => {
  // 尺寸映射
  const sizeMap = {
    small: {
      container: 'text-sm',
      title: 'text-base font-bold',
      subtitle: 'text-xs mt-1',
    },
    medium: {
      container: 'text-base',
      title: 'text-lg font-bold',
      subtitle: 'text-xs mt-1',
    },
    large: {
      container: 'text-lg',
      title: 'text-xl font-bold',
      subtitle: 'text-sm mt-2',
    },
  };

  const logoContent = (
    <div className={`logo ${sizeMap[size].container} ${className}`}>
      <div className={`logo-text ${sizeMap[size].title}`}>
        <span className="logo-normal">AI</span> Media Integration
      </div>
      {showSubtitle && (
        <div className={`logo-subtitle ${sizeMap[size].subtitle}`}>
          融媒体<span className="logo-normal">AI</span>助手系统
        </div>
      )}
      <style jsx>{`
        .logo {
          display: flex;
          flex-direction: column;
        }
        
        .logo-text {
          letter-spacing: 0.5px;
          color: var(--color-text-primary);
          text-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }
        
        .logo-normal {
          background: var(--color-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        .logo-subtitle {
          color: var(--color-text-secondary);
          letter-spacing: 0.5px;
        }
        
        @keyframes glow {
          from {
            text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          to {
            text-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }
      `}</style>
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="logo-link">
        {logoContent}
        <style jsx>{`
          .logo-link {
            text-decoration: none;
            cursor: pointer;
          }
        `}</style>
      </Link>
    );
  }

  return logoContent;
};

export default Logo; 
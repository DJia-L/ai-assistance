import React, { useState, useEffect } from 'react';

interface ErrorNotificationProps {
  message: string;
  duration?: number;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info' | 'success';
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  duration = 5000,
  onClose,
  type = 'error'
}) => {
  const [visible, setVisible] = useState(!!message);
  
  useEffect(() => {
    setVisible(!!message);
    
    // 自动关闭
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);
  
  // 没有错误信息时不渲染
  if (!message) return null;
  
  // 根据类型选择背景颜色
  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      case 'success': return '#4caf50';
      default: return '#f44336';
    }
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '12px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        maxWidth: '400px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div>{message}</div>
      <button 
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          marginLeft: '16px',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '18px'
        }}
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorNotification; 
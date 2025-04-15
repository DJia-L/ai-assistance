/**
 * 全局主题配置
 */

// 主色调
export const COLORS = {
  // 主色
  primary: '#3B82F6',       // 蓝色主色调 - DeepSeek风格
  secondary: '#10B981',     // 绿色辅助色
  
  // 文本颜色
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textDark: '#333333',
  
  // 背景颜色
  bgDark: '#111111',
  bgLight: '#fafafa',
  cardBg: 'rgba(255, 255, 255, 0.15)',
  cardHover: 'rgba(255, 255, 255, 0.25)',
  
  // 功能色
  success: '#10B981',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#3B82F6',
  
  // 渐变色
  gradient: 'linear-gradient(90deg, #3B82F6, #10B981)',
};

// 字体
export const FONTS = {
  primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  size: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    md: '1.125rem',   // 18px
    lg: '1.25rem',    // 20px
    xl: '1.5rem',     // 24px
    xxl: '2rem',      // 32px
    xxxl: '2.5rem',   // 40px
  },
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  }
};

// 边框和圆角
export const BORDERS = {
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    round: '50%',
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  }
};

// 间距
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
};

// 阴影
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
};

// 过渡动画
export const TRANSITIONS = {
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.5s',
  timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// 媒体查询断点
export const BREAKPOINTS = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

// z-index层级管理
export const Z_INDEX = {
  base: 1,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
};

// 导出默认主题
export default {
  COLORS,
  FONTS,
  BORDERS,
  SPACING,
  SHADOWS,
  TRANSITIONS,
  BREAKPOINTS,
  Z_INDEX,
}; 
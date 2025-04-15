import axios from 'axios';
import { User, LoginForm, RegisterForm } from '../types/user';

const auth = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
auth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理token过期
auth.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 判断当前页面是否已经是登录页面
      const isLoginPage = window.location.pathname === '/login';
      
      // 只有在非登录页面时才进行重定向
      if (!isLoginPage) {
        console.warn('认证失败，当前路径:', window.location.pathname);
        
        // 清除认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        
        // 保存当前URL，以便登录后跳回
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && !currentPath.includes('/login')) {
          localStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        // 重定向到登录页面
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (data: LoginForm) => {
  try {
    // 将表单数据转换为后端接口所需格式
    const loginData: any = {
      password: data.password
    };
    
    // 如果输入不包含@符号，则假定是用户名而非邮箱
    if (!data.emailOrUsername.includes('@')) {
      loginData.username = data.emailOrUsername;
    } else {
      loginData.email = data.emailOrUsername;
    }
    
    console.log('发送登录请求:', loginData, '到路径: /auth/login');
    
    const response = await auth.post('/auth/login', loginData);
    console.log('登录响应:', response);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      // 保存用户ID，供AI对话使用
      localStorage.setItem('userId', response.user.id);
    }
    return response;
  } catch (error: any) {
    console.error('登录错误详情:', error);
    
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('响应状态:', error.response.status);
      
      // 更具体的错误信息
      if (error.response.status === 404) {
        throw new Error('登录API不存在，请检查后端服务是否正常运行');
      } else if (error.response.status === 401) {
        throw new Error(error.response.data?.detail || '用户名/邮箱或密码错误');
      } else {
        throw new Error(error.response.data?.detail || `登录失败(${error.response.status})`);
      }
    }
    
    // 网络错误或后端未响应
    if (error.request) {
      throw new Error('无法连接到服务器，请检查网络连接或服务器状态');
    }
    
    // 其他错误
    throw new Error('登录过程中发生错误: ' + error.message);
  }
};

export const register = async (data: RegisterForm) => {
  try {
    const response = await auth.post('/auth/register', data);
    return response;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  localStorage.removeItem('conversationId');
  window.location.href = '/login';
};

export const getCurrentUser = (): User | null => {
  // 先检查标准键名
  let userStr = localStorage.getItem('user');
  if (!userStr) {
    // 如果没找到，尝试检查可能使用的替代键名
    userStr = localStorage.getItem('currentUser');
  }
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  // 1. 检查token是否存在
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  
  // 2. 检查用户信息
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.warn('用户信息不存在');
      return false;
    }
    
    // 3. 尝试解析用户数据
    const user = JSON.parse(userStr);
    if (!user || !user.id) {
      console.warn('用户数据无效');
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('验证token时出错:', err);
    return false;
  }
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return !!user?.is_admin;
}; 
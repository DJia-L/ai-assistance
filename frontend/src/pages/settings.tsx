import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User } from '../types/user';
import { getCurrentUser, isAuthenticated } from '../utils/auth';
import axios from 'axios';
import Head from 'next/head';
import api from '../utils/api';
import ImmersiveNav from '../components/ImmersiveNav';

export default function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  // 表单数据
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('中文');

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        // 未登录用户重定向到登录页面，并记录要跳转的目标页面
        localStorage.setItem('redirectAfterLogin', '/settings');
        router.push('/login');
        return;
      }
      
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setFormData({
          username: currentUser.username || currentUser.name || '',
          email: currentUser.email || '',
          avatar: currentUser.avatar || '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // 设置页面标题
    document.title = "设置 - 融媒体AI助手系统";
  }, [router]);

  // 加载用户列表
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('加载用户列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'system') {
      loadUsers();
    }
  }, [activeTab]);

  // 获取当前用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // 处理表单字段变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理个人信息更新提交
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', content: '' });
    
    try {
      // API调用模拟，在实际应用中替换为真实的API调用
      // const response = await axios.put('/api/user/profile', {
      //   username: formData.username,
      //   email: formData.email,
      //   avatar: formData.avatar
      // });
      
      // 模拟成功响应
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 更新本地用户数据
      const updatedUser = {
        ...user,
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar
      };
      
      setUser(updatedUser as User);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ 
        type: 'success', 
        content: '个人信息更新成功!' 
      });
    } catch (error) {
      console.error('更新个人信息失败:', error);
      setMessage({ 
        type: 'error', 
        content: '更新个人信息失败，请稍后重试' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理密码更新提交
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证新密码
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ 
        type: 'error', 
        content: '新密码与确认密码不匹配' 
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setMessage({ 
        type: 'error', 
        content: '新密码长度至少为6个字符' 
      });
      return;
    }
    
    setIsSaving(true);
    setMessage({ type: '', content: '' });
    
    try {
      // API调用模拟，在实际应用中替换为真实的API调用
      // const response = await axios.put('/api/user/password', {
      //   oldPassword: formData.oldPassword,
      //   newPassword: formData.newPassword
      // });
      
      // 模拟成功响应
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setMessage({ 
        type: 'success', 
        content: '密码更新成功!' 
      });
    } catch (error) {
      console.error('更新密码失败:', error);
      setMessage({ 
        type: 'error', 
        content: '更新密码失败，请确认原密码是否正确' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 更新用户权限
  const toggleAdminPermission = async (userId: string, hasPermission: boolean) => {
    try {
      await api.put(`/api/users/${userId}/permissions`, {
        permission: 'admin',
        action: hasPermission ? 'remove' : 'add'
      });
      
      // 更新本地状态
      setUsers(users.map(user => {
        if (user.id === userId) {
          const newPermissions = hasPermission
            ? user.permissions.filter(p => p !== 'admin')
            : [...user.permissions, 'admin'];
          return { ...user, permissions: newPermissions };
        }
        return user;
      }));
    } catch (error) {
      console.error('更新用户权限失败:', error);
      alert('更新权限失败，请重试');
    }
  };

  useEffect(() => {
    // 从localStorage加载设置
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode || false);
      setNotifications(settings.notifications !== false);
      setLanguage(settings.language || '中文');
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      darkMode,
      notifications,
      language
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    alert('设置已保存');
  };

  if (isLoading) {
    return (
      <div className="settings-container loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>用户设置 - AI Media Integration</title>
        <meta name="description" content="调整您的AI Media Integration账户设置" />
      </Head>
      
      <ImmersiveNav />
      
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <h1 className="gradient-text">账户设置</h1>
            <p>自定义您的AI Media Integration体验</p>
          </div>
          
          <div className="settings-content">
            {user ? (
              // 登录用户可以看到所有设置
              <>
                <div className="settings-section">
                  <h2>个人资料</h2>
                  <div className="profile-info">
                    <div className="avatar">
                      {(user?.username || user?.name || 'U')?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <h3>{user?.username || user?.name || '用户'}</h3>
                      <p>{user?.email || ''}</p>
                    </div>
                  </div>
                  <button className="edit-btn">编辑个人资料</button>
                </div>
                
                <div className="settings-section">
                  <h2>应用设置</h2>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>深色模式</h3>
                      <p>切换深色主题以减轻眼睛疲劳</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                        aria-label="启用深色模式"
                        title="启用深色模式"
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>通知</h3>
                      <p>接收活动和更新的通知</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                        aria-label="启用通知"
                        title="启用通知"
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>语言</h3>
                      <p>选择您偏好的语言</p>
                    </div>
                    <select 
                      className="language-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      aria-label="选择语言"
                      title="选择您偏好的语言"
                    >
                      <option value="中文">中文</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h2>安全设置</h2>
                  <button className="secondary-btn">修改密码</button>
                  <button className="secondary-btn">两步验证</button>
                </div>
                
                <div className="settings-actions">
                  <button className="cancel-btn" onClick={() => router.back()}>取消</button>
                  <button className="save-btn" onClick={saveSettings}>保存设置</button>
                </div>
              </>
            ) : (
              // 未登录用户只能看到公共设置
              <>
                <div className="settings-notice">
                  <div className="notice-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="notice-content">
                    <h3>部分功能受限</h3>
                    <p>登录后可访问更多个性化设置选项。<a href="/login" className="login-link">立即登录</a></p>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h2>应用设置</h2>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>深色模式</h3>
                      <p>切换深色主题以减轻眼睛疲劳</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                        aria-label="启用深色模式"
                        title="启用深色模式"
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>语言</h3>
                      <p>选择您偏好的语言</p>
                    </div>
                    <select 
                      className="language-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      aria-label="选择语言"
                      title="选择您偏好的语言"
                    >
                      <option value="中文">中文</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>
                
                <div className="settings-actions">
                  <button className="cancel-btn" onClick={() => router.back()}>返回</button>
                  <button className="save-btn" onClick={saveSettings}>保存设置</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .settings-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 800px;
          padding: 2.5rem;
          animation: fadeIn 0.6s ease-out;
        }
        
        .settings-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .settings-header h1 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .gradient-text {
          background: linear-gradient(90deg, #4285F4, #34A853);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .settings-header p {
          color: #666;
          font-size: 1rem;
        }
        
        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .settings-section {
          border-bottom: 1px solid #eee;
          padding-bottom: 2rem;
        }
        
        .settings-section:last-child {
          border-bottom: none;
        }
        
        .settings-section h2 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1.5rem;
        }
        
        .profile-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(90deg, #4285F4, #34A853);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.8rem;
          font-weight: 600;
        }
        
        .user-details h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
          color: #333;
        }
        
        .user-details p {
          color: #666;
          font-size: 0.9rem;
        }
        
        .edit-btn {
          background: rgba(66, 133, 244, 0.1);
          color: #4285F4;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .edit-btn:hover {
          background: rgba(66, 133, 244, 0.2);
        }
        
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f5f5f5;
        }
        
        .setting-item:last-child {
          border-bottom: none;
        }
        
        .setting-info h3 {
          font-size: 1.05rem;
          font-weight: 500;
          margin-bottom: 0.3rem;
          color: #333;
        }
        
        .setting-info p {
          color: #666;
          font-size: 0.85rem;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 52px;
          height: 26px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background: linear-gradient(90deg, #4285F4, #34A853);
        }
        
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        
        .language-select {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #333;
          background-color: #fff;
          min-width: 120px;
        }
        
        .language-select:focus {
          border-color: #4285F4;
          outline: none;
        }
        
        .secondary-btn {
          background: white;
          color: #333;
          border: 1px solid #e2e8f0;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: 1rem;
          margin-bottom: 1rem;
        }
        
        .secondary-btn:hover {
          border-color: #4285F4;
          color: #4285F4;
          background: rgba(66, 133, 244, 0.05);
        }
        
        .settings-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .cancel-btn {
          background: white;
          color: #666;
          border: 1px solid #e2e8f0;
          padding: 0.7rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .cancel-btn:hover {
          background: #f5f5f5;
        }
        
        .save-btn {
          background: linear-gradient(90deg, #4285F4, #34A853);
          color: white;
          border: none;
          padding: 0.7rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .save-btn:hover {
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
          transform: translateY(-2px);
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
        
        @media (max-width: 768px) {
          .settings-container {
            padding: 2rem 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .profile-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1rem;
          }
          
          .settings-actions {
            flex-direction: column-reverse;
            gap: 0.7rem;
          }
          
          .cancel-btn, .save-btn {
            width: 100%;
          }
        }
        
        /* 添加未登录用户提示样式 */
        .settings-notice {
          background: rgba(66, 133, 244, 0.1);
          border-radius: 8px;
          padding: 1.2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .notice-icon {
          font-size: 1.5rem;
          color: #4285F4;
        }
        
        .notice-content h3 {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
          margin-bottom: 0.3rem;
        }
        
        .notice-content p {
          color: #666;
          font-size: 0.9rem;
        }
        
        .login-link {
          color: #4285F4;
          text-decoration: none;
          font-weight: 500;
          margin-left: 0.5rem;
        }
        
        .login-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
} 
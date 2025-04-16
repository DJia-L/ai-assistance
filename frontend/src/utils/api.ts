import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// 基础URL配置
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 创建一个axios实例
const api = axios.create({
  baseURL,
  timeout: 30000, // 普通请求的超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建一个专门用于AI聊天请求的axios实例，具有更长的超时时间
const aiChatApi = axios.create({
  baseURL,
  timeout: 120000, // 增加到120秒，适应较长的AI响应时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加认证信息
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：处理响应和错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    // 获取具体错误信息
    const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          '未知错误';
    
    // 针对不同的HTTP状态码进行处理
    if (error.response) {
      const status = error.response.status;
      
      // 401表示未授权
      if (status === 401) {
        console.error('认证失败，请重新登录');
        // 清除用户认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 重定向到登录页面
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      // 403表示禁止访问
      else if (status === 403) {
        console.error('您没有权限执行此操作');
      }
      
      // 404表示资源不存在
      else if (status === 404) {
        console.error('请求的资源不存在');
      }
      
      // 422表示请求参数错误
      else if (status === 422) {
        console.error('请求参数错误:', error.response.data);
      }
      
      // 5xx表示服务器错误
      else if (status >= 500) {
        console.error('服务器错误，请稍后再试');
      }
    } 
    // 网络错误或请求被取消
    else if (error.request) {
      console.error('无法连接到服务器，请检查您的网络连接');
    }
    
    // 详细记录错误信息以便调试
    console.error('API错误详情:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      details: error.response?.data
    });
    
    return Promise.reject(new Error(errorMessage));
  }
);

// 为AI聊天API添加同样的请求拦截器
aiChatApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 为AI聊天API添加同样的响应拦截器
aiChatApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    // 如果是超时错误，提供更明确的错误信息
    if (error.code === 'ECONNABORTED') {
      console.error('AI请求超时:', error.message);
      return Promise.reject(new Error('AI响应时间过长，请稍后再试'));
    }
    
    // 获取具体错误信息
    const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.message || 
                          '未知错误';
    
    // 详细记录错误信息以便调试
    console.error('AI API错误详情:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      details: error.response?.data
    });
    
    return Promise.reject(new Error(errorMessage));
  }
);

// 缓存控制
const cache = new Map<string, {data: any, timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟

// 带有缓存的API调用
async function cachedGet<T>(url: string, config?: AxiosRequestConfig, maxRetries = 2): Promise<T> {
  const cacheKey = `${url}${JSON.stringify(config?.params || {})}`;
  const cached = cache.get(cacheKey);
  
  // 如果缓存存在且未过期，则返回缓存数据
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log(`从缓存获取: ${url}`);
    return cached.data as T;
  }
  
  // 重试机制
  let retries = 0;
  let lastError: any;
  
  while (retries <= maxRetries) {
    try {
      // 发起请求并更新缓存
      console.log(`发起请求: ${url}${retries > 0 ? ` (重试 ${retries}/${maxRetries})` : ''}`);
      const response = await api.get<T>(url, config);
      
      // 更新缓存
      cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      
      return response as T;
    } catch (error) {
      lastError = error;
      retries++;
      
      if (retries <= maxRetries) {
        // 指数退避策略 (300ms, 900ms, 2700ms...)
        const delay = 300 * Math.pow(3, retries - 1);
        console.warn(`请求失败，${retries}/${maxRetries} 次重试，等待 ${delay}ms: ${url}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 所有重试都失败后，抛出最后一个错误
  console.error(`请求失败 (已重试${maxRetries}次): ${url}`, lastError);
  throw lastError;
}

// 清除特定URL的缓存
function clearCache(urlPattern?: string) {
  if (!urlPattern) {
    cache.clear();
  } else {
    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.includes(urlPattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache.delete(key));
  }
}

// 用户相关接口
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 登录
export async function login(data: LoginRequest) {
  const response = await api.post('/api/auth/login', data);
  if (response.access_token) {
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  clearCache(); // 登录后清除所有缓存
  return response;
}

// 注册
export async function register(data: RegisterRequest) {
  return await api.post('/api/auth/register', data);
}

// 退出登录
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  clearCache(); // 退出后清除所有缓存
}

// AI对话相关接口
export interface Message {
  role: string;
  content: string;
  created_at?: string;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

// 获取任务状态
export async function getTaskStatus(taskId: string) {
  return await cachedGet<{id: string, status: string, error?: string}>(`/api/tasks/${taskId}`);
}

// 发送消息到AI
export async function sendMessage(
  message: string,
  user_id: string,
  conversation_id?: string,
  model_type: string = "deepseek",
  messages?: Message[],
  use_knowledge_base?: boolean,
  knowledge_base_id?: string
) {
  try {
    console.log(`准备发送消息到AI, 用户ID: ${user_id}, 使用知识库: ${use_knowledge_base}, 知识库ID: ${knowledge_base_id}`);
    console.log(`对话ID: ${conversation_id}, 模型类型: ${model_type}`);
    
    if (!user_id) {
      throw new Error('用户ID不能为空');
    }
    
    // 历史消息处理
    let messageHistory = undefined;
    
    // 如果前端已经提供了完整消息历史，直接使用
    if (messages && messages.length > 0) {
      console.log(`使用前端传递的消息历史，共 ${messages.length} 条消息`);
      
      // 限制历史消息数量，防止请求过大导致超时
      // 保留最近的20条消息，确保上下文连贯性
      const MAX_HISTORY_MESSAGES = 20;
      
      if (messages.length > MAX_HISTORY_MESSAGES) {
        console.log(`消息数量超过限制(${MAX_HISTORY_MESSAGES})，将只保留最新的消息`);
        messageHistory = messages.slice(-MAX_HISTORY_MESSAGES).map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      } else {
        messageHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      }
      
      console.log('处理后的消息历史数量:', messageHistory.length);
    }
    
    // 构建请求数据
    const requestData = {
      text: message,
      user_id,
      conversation_id,
      model_type,
      messages: messageHistory,
      use_knowledge_base,
      knowledge_base_id
    };
    
    console.log('发送请求数据:', requestData);
    
    const response = await aiChatApi.post('/api/ai/chat', requestData);
    console.log('收到AI响应原始数据:', response);
    console.log('响应数据类型:', typeof response);
    
    // 更灵活地处理各种响应格式
    let responseText = '';
    let responseConversationId = conversation_id;
    let responseModel = model_type;
    
    // 检查并提取响应文本
    if (response && typeof response === 'object') {
      console.log('解析响应对象...');
      
      // 如果是error响应
      if (response.success === false || response.error) {
        const errorMessage = response.error || '未知错误';
        console.error('AI服务返回错误:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // 尝试从不同格式中提取文本
      if (response.text) {
        // 直接包含text字段的响应
        responseText = response.text;
        responseConversationId = response.conversation_id || conversation_id;
        responseModel = response.model || model_type;
        console.log('从text字段获取响应:', responseText);
      } 
      else if (response.data && response.data.text) {
        // 嵌套在data中的响应
        responseText = response.data.text;
        responseConversationId = response.data.conversation_id || conversation_id;
        responseModel = response.data.model || model_type;
        console.log('从data.text字段获取响应:', responseText);
      }
      else if (response.choices && response.choices.length > 0) {
        // DeepSeek API原始格式
        responseText = response.choices[0].message.content;
        console.log('从choices获取响应:', responseText);
      }
      else if (response.data && response.data.choices && response.data.choices.length > 0) {
        // 嵌套在data中的DeepSeek API格式
        responseText = response.data.choices[0].message.content;
        console.log('从data.choices获取响应:', responseText);
      }
      else {
        console.error('无法从响应中提取文本:', response);
        throw new Error('无法识别的AI响应格式');
      }
    } else {
      console.error('AI响应不是有效对象:', response);
      throw new Error('接收到无效的AI响应');
    }
    
    // 检查是否成功提取到文本
    if (!responseText) {
      console.error('未能从响应中提取到文本内容:', response);
      throw new Error('AI响应缺少必要的文本内容');
    }
    
    // 返回统一格式的响应
    const result = {
      text: responseText,
      conversation_id: responseConversationId,
      success: true,
      model: responseModel
    };
    
    console.log('最终处理后的AI响应:', result);
    return result;
    
  } catch (error) {
    console.error('发送消息失败:', error);
    // 重新格式化错误信息
    const errorMessage = error instanceof Error ? error.message : '发送消息失败，请稍后重试';
    throw new Error(errorMessage);
  }
}

// 获取用户的所有对话
export async function getConversations() {
  return await cachedGet<Conversation[]>('/api/ai/conversations');
}

// 获取用户指定模型类型的对话历史
export async function getUserConversations(user_id: string, model_type?: string) {
  let url = `/api/ai/conversations?user_id=${user_id}`;
  if (model_type) {
    url += `&model_type=${model_type}`;
  }
  return await cachedGet<Conversation[]>(url);
}

// 获取特定对话的详情
export async function getConversation(conversation_id: string) {
  return await cachedGet<Conversation>(`/api/ai/conversations/${conversation_id}`);
}

// 更新对话
export async function updateConversation(conversation_id: string, messages: Message[]) {
  // 限制历史消息数量，保持和后端的限制一致
  const MAX_MESSAGES_PER_CONVERSATION = 100;
  let messagesToSend = messages;
  
  if (messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    console.warn(`对话消息数量(${messages.length})超过限制(${MAX_MESSAGES_PER_CONVERSATION})，将只保留最新的消息`);
    messagesToSend = messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
  }
  
  const response = await api.put(`/api/ai/conversations/${conversation_id}`, { 
    messages: messagesToSend.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  });
  // 清除相关缓存
  clearCache(`/api/ai/conversations/${conversation_id}`); 
  clearCache('/api/ai/conversations');
  return response;
}

// 创建新对话
export async function createNewConversation(title: string, model_type: string, user_id: string, initial_message: string) {
  const response = await api.post('/api/ai/conversations', { 
    title, 
    model_type,
    user_id,
    first_message: initial_message
  });
  clearCache('/api/ai/conversations'); // 清除相关缓存
  return response;
}

// 删除对话
export async function deleteConversation(conversation_id: string) {
  const response = await api.delete(`/api/ai/conversations/${conversation_id}`);
  // 清除相关缓存
  clearCache(`/api/ai/conversations/${conversation_id}`);
  clearCache('/api/ai/conversations');
  return response;
}

// 知识库相关接口
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  type: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  file_path: string;
  kb_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// 创建知识库
export async function createKnowledgeBase(name: string, description: string = "", type: string = "personal") {
  const response = await api.post('/api/kb', { 
    name, 
    description,
    type
  });
  clearCache('/api/kb'); // 清除相关缓存
  return response;
}

// 获取用户知识库列表
export async function getUserKnowledgeBases(userId: string) {
  return await cachedGet<KnowledgeBase[]>(`/api/kb/user/${userId}`);
}

// 上传文档到知识库
export async function uploadDocumentToKnowledgeBase(kbId: string, title: string, file: File) {
  // 使用FormData上传文件
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  
  try {
    const response = await api.post(
      `/api/kb/${kbId}/document`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // 清除相关缓存
    clearCache(`/api/kb/${kbId}`);
    
    // 确保返回一个标准格式的文档对象
    return {
      id: response.id || (response.data ? response.data.id : null),
      title: response.title || (response.data ? response.data.title : title),
      file_path: response.file_path || (response.data ? response.data.file_path : null),
      kb_id: response.kb_id || (response.data ? response.data.kb_id : kbId),
      status: response.status || (response.data ? response.data.status : 'processing')
    };
  } catch (error) {
    console.error('上传文档失败:', error);
    throw error;
  }
}

// 获取知识库详情
export async function getKnowledgeBaseDetails(kbId: string) {
  return await cachedGet<KnowledgeBase & { documents: KnowledgeDocument[] }>(`/api/kb/${kbId}`);
}
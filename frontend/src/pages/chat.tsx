import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { sendMessage, getUserConversations, Conversation as ApiConversation, getTaskStatus, updateConversation, deleteConversation, getUserKnowledgeBases, createKnowledgeBase, uploadDocumentToKnowledgeBase } from '../utils/api';
import { useRouter } from 'next/router';
import axios from 'axios';
import { message } from 'antd';
import type { Message as ChatMessage, MessageRole } from '../types/chat';

// 本地对话界面使用的对话类型
interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// 从 API 转换到本地对话格式
const convertApiToLocalConversation = (apiConv: ApiConversation): Conversation => {
  return {
    id: apiConv.id,
    title: apiConv.title,
    messages: apiConv.messages.map(msg => {
      const message: ChatMessage = {
        role: msg.role as MessageRole,
        content: msg.content,
        timestamp: new Date()
      };
      // 如果API返回中有model字段，则添加到本地消息对象中
      if (msg.model && typeof msg.model === 'string') {
        message.model = msg.model;
      }
      return message;
    }),
    createdAt: new Date(apiConv.created_at)
  };
};

// 确保这是一个有效的函数组件
export default function ChatPage() {
  // Hook必须在函数组件内部使用
  const [selectedModel, setSelectedModel] = useState('airong');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 按模型类型分类的对话历史状态
  const [conversationsByModel, setConversationsByModel] = useState<{[key: string]: Conversation[]}>({
    'airong': [{ id: 'airong-1', title: 'AI小融对话', messages: [], createdAt: new Date() }],
    'aimi': [{ id: 'aimi-1', title: 'AI小秘对话', messages: [], createdAt: new Date() }],
    'deepseek': [{ id: 'deepseek-1', title: 'DeepSeek对话', messages: [], createdAt: new Date() }]
  });
  
  // 每个模型的当前活跃对话ID
  const [activeConversationIds, setActiveConversationIds] = useState<{[key: string]: string}>({
    'airong': 'airong-1',
    'aimi': 'aimi-1',
    'deepseek': 'deepseek-1'
  });

  // 当前模型的对话列表
  const conversations = conversationsByModel[selectedModel] || [];
  // 当前活跃对话ID
  const activeConversationId = activeConversationIds[selectedModel] || '';

  // 设置知识库默认启用
  const [useKnowledgeBase, setUseKnowledgeBase] = useState<boolean>(true);

  // 添加状态和处理函数
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [webUrl, setWebUrl] = useState('');

  // 添加任务状态跟踪
  const [taskStatus, setTaskStatus] = useState<{id: string, status: string, error?: string} | null>(null);
  const taskCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 在组件挂载后检查管理员权限
  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        const user = JSON.parse(userStr);
        // 检查用户权限中是否包含管理员权限
        return user.permissions?.includes('admin') || false;
      } catch (error) {
        console.error('检查管理员权限失败:', error);
        return false;
      }
    };
    
    setIsAdminUser(checkAdminStatus());
  }, []);

  // 组件挂载时执行的操作
  useEffect(() => {
    // 初始化操作
    console.log('聊天组件已挂载');
    loadConversationsFromServer();
  }, []);

  // 当选择的模型改变时，加载对应模型的对话记录
  useEffect(() => {
    // 如果有活跃的对话ID，加载对应的消息
    if (activeConversationId) {
      const conversation = conversations.find(conv => conv.id === activeConversationId);
      if (conversation) {
        setMessages(conversation.messages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [selectedModel, activeConversationId]);

  // 从服务器加载对话记录
  const loadConversationsFromServer = async () => {
    try {
      // 获取用户ID
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.warn('无法加载对话记录: 用户未登录');
        return;
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id || 'anonymous-user';
      console.log('从服务器加载对话记录，用户ID:', userId);
      
      try {
        // 获取各模型的对话历史
        const deepseekApiConversations = await getUserConversations(userId, 'deepseek').catch(err => {
          console.warn('加载deepseek对话失败:', err);
          return [];
        });
        
        const airongApiConversations = await getUserConversations(userId, 'airong').catch(err => {
          console.warn('加载airong对话失败:', err);
          return [];
        });
        
        const aimiApiConversations = await getUserConversations(userId, 'aimi').catch(err => {
          console.warn('加载aimi对话失败:', err);
          return [];
        });
        
        // 将API返回的对话转换为本地格式
        const deepseekConversations = Array.isArray(deepseekApiConversations) ? 
          deepseekApiConversations.map(convertApiToLocalConversation) : [];
          
        const airongConversations = Array.isArray(airongApiConversations) ? 
          airongApiConversations.map(convertApiToLocalConversation) : [];
          
        const aimiConversations = Array.isArray(aimiApiConversations) ? 
          aimiApiConversations.map(convertApiToLocalConversation) : [];
        
        // 对话数量限制处理
        const MAX_CONVERSATIONS_PER_MODEL = 20;
        
        // 如果对话超过限制，删除最旧的对话
        if (deepseekConversations.length > MAX_CONVERSATIONS_PER_MODEL) {
          console.log(`Deepseek对话数量(${deepseekConversations.length})超过限制(${MAX_CONVERSATIONS_PER_MODEL})，删除最旧的对话`);
          // 按更新时间排序，保留最新的
          deepseekConversations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          // 获取要删除的对话ID列表
          const toDeleteIds = deepseekConversations.slice(MAX_CONVERSATIONS_PER_MODEL).map(conv => conv.id);
          // 批量删除旧对话
          await Promise.all(toDeleteIds.map(id => deleteConversationFromServer(id)));
          // 只保留最新的对话
          deepseekConversations.splice(MAX_CONVERSATIONS_PER_MODEL);
        }
        
        if (airongConversations.length > MAX_CONVERSATIONS_PER_MODEL) {
          console.log(`AI小融对话数量(${airongConversations.length})超过限制(${MAX_CONVERSATIONS_PER_MODEL})，删除最旧的对话`);
          airongConversations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          const toDeleteIds = airongConversations.slice(MAX_CONVERSATIONS_PER_MODEL).map(conv => conv.id);
          await Promise.all(toDeleteIds.map(id => deleteConversationFromServer(id)));
          airongConversations.splice(MAX_CONVERSATIONS_PER_MODEL);
        }
        
        if (aimiConversations.length > MAX_CONVERSATIONS_PER_MODEL) {
          console.log(`AI小秘对话数量(${aimiConversations.length})超过限制(${MAX_CONVERSATIONS_PER_MODEL})，删除最旧的对话`);
          aimiConversations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          const toDeleteIds = aimiConversations.slice(MAX_CONVERSATIONS_PER_MODEL).map(conv => conv.id);
          await Promise.all(toDeleteIds.map(id => deleteConversationFromServer(id)));
          aimiConversations.splice(MAX_CONVERSATIONS_PER_MODEL);
        }
        
        // 如果没有对话，则保持默认空对话
        setConversationsByModel(prev => ({
          'airong': airongConversations.length > 0 ? airongConversations : prev.airong || [],
          'aimi': aimiConversations.length > 0 ? aimiConversations : prev.aimi || [],
          'deepseek': deepseekConversations.length > 0 ? deepseekConversations : prev.deepseek || []
        }));
        
        // 设置活跃对话ID
        const newActiveIds = { ...activeConversationIds };
        
        if (deepseekConversations.length > 0) {
          newActiveIds.deepseek = deepseekConversations[0].id;
        }
        
        if (airongConversations.length > 0) {
          newActiveIds.airong = airongConversations[0].id;
        }
        
        if (aimiConversations.length > 0) {
          newActiveIds.aimi = aimiConversations[0].id;
        }
        
        setActiveConversationIds(newActiveIds);
      } catch (error) {
        console.error('加载对话记录请求失败:', error);
        // 创建空的默认对话，确保UI正常显示
        createDefaultConversations();
      }
    } catch (error) {
      console.error('加载对话记录失败:', error);
      // 创建空的默认对话，确保UI正常显示
      createDefaultConversations();
    }
  };
  
  // 创建默认的空对话列表
  const createDefaultConversations = () => {
    const now = new Date();
    setConversationsByModel({
      'airong': [{ id: `airong-${Date.now()}`, title: 'AI小融对话', messages: [], createdAt: now }],
      'aimi': [{ id: `aimi-${Date.now()}`, title: 'AI小秘对话', messages: [], createdAt: now }],
      'deepseek': [{ id: `deepseek-${Date.now()}`, title: 'DeepSeek对话', messages: [], createdAt: now }]
    });
  };

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 添加页面标题设置
  useEffect(() => {
    document.title = "聊天 - 融媒体AI助手系统";
  }, []);

  // 处理文本区域自动调整高度
  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 150)}px`;
  };

  // 创建新对话
  const createNewConversation = () => {
    const modelPrefix = selectedModel === 'deepseek' ? 'deepseek' : 
                       selectedModel === 'airong' ? 'airong' : 'aimi';
    const newId = `${modelPrefix}-${Date.now()}`;
    const newConversation = {
      id: newId,
      title: `新${selectedModel === 'deepseek' ? 'DeepSeek' : 
              selectedModel === 'airong' ? 'AI小融' : 'AI小秘'}对话`,
      messages: [],
      createdAt: new Date()
    };
    
    // 更新当前模型的对话列表
    const updatedConversations = [newConversation, ...(conversationsByModel[selectedModel] || [])];
    setConversationsByModel({
      ...conversationsByModel,
      [selectedModel]: updatedConversations
    });
    
    // 更新当前模型的活跃对话ID
    setActiveConversationIds({
      ...activeConversationIds,
      [selectedModel]: newId
    });
    
    // 清空消息列表
    setMessages([]);
  };

  // 从服务器删除对话
  const deleteConversationFromServer = async (id: string) => {
    try {
      await deleteConversation(id);
      console.log(`对话 ${id} 已从服务器删除`);
      return true;
    } catch (error) {
      console.error(`删除对话 ${id} 失败:`, error);
      return false;
    }
  };
  
  // 删除对话
  const deleteConversation = async (id: string, e?: React.MouseEvent) => {
    // 阻止事件冒泡，防止触发点击对话的事件
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // 获取要删除的对话
    const model = selectedModel;
    const conversationsInModel = [...conversationsByModel[model]];
    
    // 从服务器删除对话
    const success = await deleteConversationFromServer(id);
    
    if (success) {
      // 从本地状态移除对话
      const updatedConversations = conversationsInModel.filter(conv => conv.id !== id);
      
      // 更新状态
      setConversationsByModel({
        ...conversationsByModel,
        [model]: updatedConversations
      });
      
      // 如果删除的是当前活跃对话，重新设置活跃对话ID
      if (id === activeConversationIds[model]) {
        // 如果还有其他对话，选择第一个作为活跃对话
        if (updatedConversations.length > 0) {
          setActiveConversationIds({
            ...activeConversationIds,
            [model]: updatedConversations[0].id
          });
          setMessages(updatedConversations[0].messages);
        } else {
          // 如果没有对话了，创建一个新的空对话
          const newConv = { 
            id: `${model}-${Date.now()}`, 
            title: `新对话`, 
            messages: [], 
            createdAt: new Date() 
          };
          
          setConversationsByModel({
            ...conversationsByModel,
            [model]: [newConv]
          });
          
          setActiveConversationIds({
            ...activeConversationIds,
            [model]: newConv.id
          });
          
          setMessages([]);
        }
      }
      
      message.success('对话已删除');
    } else {
      message.error('删除对话失败');
    }
  };

  // 切换到指定对话
  const switchConversation = (id) => {
    // 更新当前模型的活跃对话ID
    setActiveConversationIds({
      ...activeConversationIds,
      [selectedModel]: id
    });
    
    // 获取对话内容并设置消息列表
    const conversation = conversationsByModel[selectedModel]?.find(conv => conv.id === id);
    if (conversation) {
      setMessages(conversation.messages);
    }
  };

  // 更新对话标题
  const updateConversationTitle = (messageText) => {
    // 从用户第一条消息提取标题（最多20个字符）
    let title = messageText.slice(0, 20);
    if (messageText.length > 20) title += '...';
    
    // 获取当前模型的对话列表
    const currentConversations = [...(conversationsByModel[selectedModel] || [])];
    // 更新指定对话的标题
    const updatedConversations = currentConversations.map(conv => 
      conv.id === activeConversationId ? { ...conv, title } : conv
    );
    
    // 更新当前模型的对话列表
    setConversationsByModel({
      ...conversationsByModel,
      [selectedModel]: updatedConversations
    });
  };

  // 更新当前对话的消息
  const updateCurrentConversationMessages = (updatedMessages) => {
    // 获取当前模型的对话列表
    const currentConversations = [...(conversationsByModel[selectedModel] || [])];
    // 更新指定对话的消息
    const updatedConversations = currentConversations.map(conv => 
      conv.id === activeConversationId ? { ...conv, messages: updatedMessages } : conv
    );
    
    // 更新当前模型的对话列表
    setConversationsByModel({
      ...conversationsByModel,
      [selectedModel]: updatedConversations
    });
    
    // 将对话保存到服务器
    saveConversationToServer(activeConversationId, updatedMessages);
  };
  
  // 将对话保存到服务器
  const saveConversationToServer = async (conversationId: string, messages: ChatMessage[]) => {
    try {
      if (!conversationId) {
        console.warn('无法保存对话：对话ID不存在');
        return;
      }
      
      console.log('保存对话到服务器，对话ID:', conversationId, '消息数量:', messages.length);
      
      // 通过API保存对话
      await updateConversation(conversationId, messages);
      
      console.log('对话保存成功');
    } catch (error) {
      console.error('保存对话失败:', error);
      message.error('保存对话失败，但您可以继续对话');
    }
  };

  // 判断当前模型是否支持知识库
  const isKnowledgeBaseSupported = () => {
    return selectedModel === 'airong' || selectedModel === 'aimi';
  };

  // 检查或创建知识库
  const checkOrCreateKnowledgeBase = async (): Promise<string | null> => {
    try {
      // 获取当前用户信息
      const user = localStorage.getItem('user');
      if (!user) {
        console.error('用户未登录');
        return null;
      }
      
      const userId = JSON.parse(user).id;
      let kbId = localStorage.getItem(`${userId}_knowledge_base_id`);
      
      // 如果本地已有知识库ID，直接返回
      if (kbId) {
        return kbId;
      }
      
      // 获取用户的知识库列表
      const userKbs = await getUserKnowledgeBases(userId);
      
      if (userKbs && userKbs.length > 0) {
        // 使用第一个个人知识库
        kbId = userKbs[0].id;
        // 保存到本地存储
        localStorage.setItem(`${userId}_knowledge_base_id`, kbId);
        return kbId;
      }
      
      // 如果没有知识库，创建一个新的
      const newKbResponse = await createKnowledgeBase('我的个人知识库', '自动创建的个人知识库', 'personal');
      
      // 确保响应是对象且包含id字段
      if (newKbResponse && typeof newKbResponse === 'object' && 'id' in newKbResponse) {
        kbId = String(newKbResponse.id);
        // 保存到本地存储
        localStorage.setItem(`${userId}_knowledge_base_id`, kbId);
        return kbId;
      } else {
        console.error('创建知识库失败：无效的响应', newKbResponse);
        return null;
      }
    } catch (error) {
      console.error('检查或创建知识库失败:', error);
      return null;
    }
  };

  // 发送消息并获取回复
  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return;
    
    setIsSending(true);
    const messageText = input.trim();
    setInput('');
    
    try {
      // 获取用户信息
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('请先登录后再进行对话');
      }
      const user = JSON.parse(userStr);
      const userId = user.id;
      
      // 如果是新对话，更新标题
      if (messages.length === 0) {
        updateConversationTitle(messageText);
      }
      
      // 添加用户消息到列表
      const userMessage: ChatMessage = { 
        role: 'user' as MessageRole, 
        content: messageText,
        timestamp: new Date()
      };
      
      console.log('添加用户消息:', userMessage);
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      console.log('更新后的消息列表:', updatedMessages);
      
      // 检查是否使用知识库
      let kbId = null;
      if (isKnowledgeBaseSupported() && useKnowledgeBase) {
        kbId = await checkOrCreateKnowledgeBase();
      }
      
      console.log('准备发送消息:', {
        messageText,
        userId,
        conversationId: activeConversationId,
        modelType: selectedModel,
        messagesCount: updatedMessages.length,
        useKnowledgeBase,
        kbId
      });
      
      // 发送消息到AI
      const response = await sendMessage(
        messageText,
        userId,
        activeConversationId,
        selectedModel,
        updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        useKnowledgeBase,
        kbId
      );
      
      console.log('收到AI响应:', response);
      
      if (response && response.text) {
        // 添加AI回复到消息列表
        const aiMessage: ChatMessage = { 
          role: 'assistant' as MessageRole, 
          content: response.text,
          model: response.model || selectedModel,
          timestamp: new Date()
        };
        
        console.log('添加AI回复消息:', aiMessage);
        const newMessages = [...updatedMessages, aiMessage];
        console.log('添加AI回复后的消息列表:', newMessages);
        
        // 强制重新渲染消息列表
        setMessages([...newMessages]);
        
        // 如果是新对话且收到了会话ID，更新活跃对话ID
        if (response.conversation_id && activeConversationId !== response.conversation_id) {
          console.log('更新对话ID:', response.conversation_id);
          const newActiveIds = {
            ...activeConversationIds,
            [selectedModel]: response.conversation_id
          };
          setActiveConversationIds(newActiveIds);
          
          // 更新当前模型的对话列表，添加新对话或更新已有对话
          const existingConversationIndex = conversationsByModel[selectedModel]?.findIndex(
            conv => conv.id === response.conversation_id
          );
          
          const updatedConversationList = [...(conversationsByModel[selectedModel] || [])];
          
          if (existingConversationIndex >= 0) {
            // 更新已存在的对话
            updatedConversationList[existingConversationIndex] = {
              ...updatedConversationList[existingConversationIndex],
              messages: newMessages
            };
          } else {
            // 添加新对话
            const title = messageText.length > 20 ? messageText.slice(0, 20) + '...' : messageText;
            updatedConversationList.unshift({
              id: response.conversation_id,
              title,
              messages: newMessages,
              createdAt: new Date()
            });
          }
          
          // 更新对话列表状态
          setConversationsByModel({
            ...conversationsByModel,
            [selectedModel]: updatedConversationList
          });
        } else {
          // 正常更新当前对话的消息
          updateCurrentConversationMessages(newMessages);
        }
      } else {
        throw new Error('AI回复格式错误');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 显示错误消息
      message.error(error instanceof Error ? error.message : '发送消息失败，请重试');
      // 移除失败的消息
      setMessages(messages);
    } finally {
      setIsSending(false);
    }
  };

  // 切换模型
  const handleModelChange = (model) => {
    setSelectedModel(model);
    // 模型改变时，activeConversationId 会通过 useEffect 自动更新
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 处理上传
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('请先选择一个文件');
      return;
    }
    
    try {
      // 获取或创建知识库
      const kbId = await checkOrCreateKnowledgeBase();
      
      if (!kbId) {
        alert('无法创建或获取知识库，请稍后重试');
        return;
      }
      
      // 上传文件
      const response = await uploadDocumentToKnowledgeBase(
        kbId,
        selectedFile.name,
        selectedFile
      );
      
      if (response) {
        // 设置任务状态监控
        setTaskStatus({
          id: response.id || String(response.data?.id),
          status: response.status || response.data?.status || 'processing'
        });
        
        // 设置定时器检查任务状态
        if (taskCheckIntervalRef.current) {
          clearInterval(taskCheckIntervalRef.current);
        }
        
        // 每3秒检查一次任务状态，直到任务完成或失败
        taskCheckIntervalRef.current = setInterval(async () => {
          try {
            const statusId = response.id || response.data?.id;
            if (!statusId) {
              console.error('无效的任务ID');
              clearInterval(taskCheckIntervalRef.current);
              return;
            }
            
            const statusResponse = await getTaskStatus(String(statusId));
            if (statusResponse) {
              setTaskStatus(statusResponse);
              
              // 如果任务完成或失败，停止检查
              if (statusResponse.status === 'completed' || statusResponse.status === 'failed') {
                if (taskCheckIntervalRef.current) {
                  clearInterval(taskCheckIntervalRef.current);
                  taskCheckIntervalRef.current = null;
                }
              }
            }
          } catch (error) {
            console.error('检查任务状态失败:', error);
            if (taskCheckIntervalRef.current) {
              clearInterval(taskCheckIntervalRef.current);
              taskCheckIntervalRef.current = null;
            }
          }
        }, 3000);
        
        // 显示上传成功消息
        setShowUploadModal(false);
        setSelectedFile(null);
        
        // 添加一条系统消息，告知用户文件已上传
        const systemMessage = { 
          role: 'system' as const, 
          content: `文件 "${selectedFile.name}" 已上传到知识库，正在处理中。处理完成后，您可以通过提问来获取文件内容。`,
          timestamp: new Date()
        };
        
        const updatedMessages = [...messages, systemMessage];
        setMessages(updatedMessages);
        updateCurrentConversationMessages(updatedMessages);
      } else {
        alert('文件上传失败，请重试');
      }
    } catch (error) {
      console.error('上传文件过程出错:', error);
      alert('上传过程中出错，请重试');
    }
  };

  // 监控任务状态变化
  useEffect(() => {
    // 当任务状态变化时，如果任务完成或失败，添加一条系统消息
    if (taskStatus && (taskStatus.status === 'completed' || taskStatus.status === 'failed')) {
      const statusMessage = { 
        role: 'system' as const, 
        content: taskStatus.status === 'completed' 
          ? `文档处理完成，现在您可以提问关于该文档的问题了。` 
          : `文档处理失败: ${taskStatus.error || '未知错误'}`,
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, statusMessage];
      setMessages(updatedMessages);
      updateCurrentConversationMessages(updatedMessages);
      
      // 清除任务状态
      setTaskStatus(null);
    }
    
    // 组件卸载时清除定时器
    return () => {
      if (taskCheckIntervalRef.current) {
        clearInterval(taskCheckIntervalRef.current);
      }
    };
  }, [taskStatus]);

  return (
    <div className="chat-container">
      <Head>
        <title>AI对话 | DeepSeek风格</title>
        <meta name="description" content="AI对话助手" />
      </Head>
      
      <div className="chat-content">
        <div className="layout">
          {/* 左侧历史栏 */}
          <div className="chat-sidebar">
            <div className="chat-controls">
              <button onClick={createNewConversation} className="new-chat-button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                <span>开启新对话</span>
              </button>
              {isAdminUser && (
                <Link href="/knowledge-management" legacyBehavior>
                  <a className="manage-kb-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      <path d="M7 8h10M7 12h10M7 16h10" />
                    </svg>
                    <span>管理知识库</span>
                  </a>
                </Link>
              )}
            </div>
            
            <div className="conversation-list">
              {conversations.length > 0 && (
                <div className="history-group">
                  <div className="group-title">对话历史</div>
                  {conversations.map(conv => (
                    <div 
                      key={conv.id} 
                      className={`history-item ${activeConversationId === conv.id ? 'active' : ''}`}
                      onClick={() => switchConversation(conv.id)}
                    >
                      <span className="history-title">{conv.title}</span>
                      <button 
                        className="delete-btn"
                        onClick={(e) => deleteConversation(conv.id, e)}
                        title="删除对话"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bottom-buttons">
              <Link href="/" legacyBehavior>
                <a className="bottom-button home-button">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span>首页</span>
                </a>
              </Link>
              <button className="bottom-button settings-button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15c1.93 0 3.5-1.57 3.5-3.5S13.93 8 12 8s-3.5 1.57-3.5 3.5S10.07 15 12 15z" />
                  <path d="M19.14 12.94c-.12-.33-.28-.64-.46-.93-.18-.31-.39-.6-.62-.84-.23-.25-.47-.47-.73-.66-.27-.2-.55-.37-.84-.51-.16-.08-.33-.15-.5-.21-.16-.06-.33-.11-.5-.16l-.11-.03c-.22-.06-.44-.1-.65-.12-.86-.09-1.61.46-1.8 1.3l-.04.21c-.05.25-.09.51-.1.76-.04.41-.04.86 0 1.29.01.22.03.43.06.65l.03.13c.05.16.09.32.14.48.07.21.15.41.24.61.1.2.2.39.32.57.26.4.57.77.91 1.09.34.31.71.58 1.1.8.77.44 1.65.69 2.53.69h.04c.88-.01 1.76-.25 2.53-.7.38-.22.75-.48 1.08-.79.34-.31.65-.69.91-1.09.12-.18.23-.37.32-.57.09-.2.17-.4.24-.61.05-.16.09-.32.13-.48l.03-.13c.03-.21.05-.43.06-.65.02-.43.02-.87-.01-1.29-.01-.26-.05-.51-.1-.76l-.04-.21c-.29-1.29-1.73-1.7-2.73-1.26zm.02 2.72c-.03.29-.08.57-.17.85-.06.18-.13.35-.22.52-.09.16-.18.32-.29.46-.12.16-.24.3-.38.42-.14.13-.3.24-.47.33-.17.09-.34.17-.53.22-.19.05-.38.09-.58.09h-.01c-.19 0-.38-.03-.56-.08-.19-.05-.37-.13-.53-.22-.16-.09-.32-.2-.46-.33-.14-.13-.27-.27-.38-.42-.11-.15-.2-.3-.29-.46-.09-.17-.16-.34-.22-.52-.07-.27-.12-.55-.15-.84v-.02c-.01-.22-.02-.44 0-.66v-.02c.01-.22.04-.43.09-.64l.02-.07c.05-.17.11-.33.17-.48.08-.19.17-.36.28-.52.1-.16.22-.31.36-.45.13-.13.28-.25.44-.35.15-.1.32-.18.49-.24.17-.06.35-.1.53-.11h.05c.17-.01.35.01.52.05.16.04.32.09.46.16.15.07.29.15.42.25.12.1.24.2.34.32s.2.24.27.37c.08.13.14.27.19.42.07.2.12.41.14.63v.01c.03.23.04.46.03.69-.01.23-.04.45-.08.67z" />
                </svg>
                <span>设置</span>
              </button>
            </div>
          </div>
          
          {/* 右侧聊天区域 */}
          <div className="chat-content">
            <div className="chat-area">
              {/* 对话内容展示区域 */}
              <div className="messages-container">
                {messages && messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                      <div className="message-bubble">
                        <div className="message-content">{msg.content}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-chat">
                    <p>开始与AI助手对话吧！</p>
                    <p className="chat-tip">选择左侧对话或发送新消息</p>
                  </div>
                )}
                {isSending && (
                  <div className="sending-indicator">
                    正在输入...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="input-area">
                <div className="AI-Models">
                  <div className={`model-description ${selectedModel === 'airong' ? 'active' : ''}`}
                    onClick={() => handleModelChange('airong')}>
                    <span className="model-name">AI小融：</span>
                    <span className="model-info">融媒体平台的AI模型</span>
                  </div>
                  <div className={`model-description ${selectedModel === 'aimi' ? 'active' : ''}`}
                    onClick={() => handleModelChange('aimi')}>
                    <span className="model-name">AI小秘：</span>
                    <span className="model-info">用户的个人AI助理</span>
                  </div>
                  <div className={`model-description ${selectedModel === 'deepseek' ? 'active' : ''}`}
                    onClick={() => handleModelChange('deepseek')}>
                    <span className="model-name">DeepSeek：</span>
                    <span className="model-info">deepseek官方模型</span>
                  </div>
                </div>
                
                <div className="input-container">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      adjustTextareaHeight(e.target);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="message-input"
                    placeholder="输入消息，按Enter发送，Shift+Enter换行"
                  />
                  
                  <div className="buttons-container">
                    {/* 知识库提示语 - 只在支持的模型显示 */}
                    {isKnowledgeBaseSupported() && (
                      <>
                        <div className="knowledge-base-status">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          知识库已启用
                        </div>
                        <button
                          className="upload-file-button"
                          onClick={() => setShowUploadModal(true)}
                          type="button"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          上传文件
                        </button>
                      </>
                    )}
                    
                    <button 
                      className="send-button" 
                      onClick={handleSendMessage}
                      disabled={isSending || !input.trim()}
                    >
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 知识库文件上传模态框 */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>上传知识库文件</h3>
              <button 
                className="close-button"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="upload-option">
                <h4>从本地上传文件</h4>
                <p>支持PDF、DOCX、TXT、MD、CSV、JSON等格式的文件。</p>
                
                <label className="file-upload-label">
                  选择文件
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.txt,.md,.csv,.json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                
                {selectedFile && (
                  <div className="selected-file">
                    已选择: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-button" 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
              >
                取消
              </button>
              <button 
                className="upload-button" 
                onClick={handleFileUpload}
                disabled={!selectedFile}
              >
                上传
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 任务状态提示 */}
      {taskStatus && taskStatus.status === 'processing' && (
        <div className="task-status-indicator">
          <div className="spinner"></div>
          <span>文档处理中，请稍候...</span>
        </div>
      )}
      
      <style jsx>{`
        .chat-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .chat-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        
        .layout {
          display: flex;
          width: 100%;
          height: 100%;
        }
        
        /* 左侧边栏样式 */
        .chat-sidebar {
          width: 260px;
          background-color: #f9f9f9;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #e0e0e0;
          height: 100%;
          overflow-y: auto;
        }
        
        .chat-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px;
        }
        
        .conversation-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          margin-top: 10px;
        }
        
        .history-group {
          margin-bottom: 14px;
        }
        
        .group-title {
          font-size: 12px;
          color: #888;
          margin-bottom: 8px;
          padding-left: 10px;
        }
        
        .history-item {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #555;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .history-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .delete-btn {
          opacity: 0;
          background: none;
          border: none;
          padding: 2px;
          margin-left: 6px;
          border-radius: 8px;
          cursor: pointer;
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .history-item:hover .delete-btn {
          opacity: 1;
        }
        
        .delete-btn:hover {
          background-color: #ffe6e6;
          color: #e53935;
        }
        
        .history-item.active {
          background-color: #e6f0ff;
          color: #1a73e8;
        }
        
        .history-item:hover {
          background-color: #f0f0f0;
        }
        
        .app-button {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 10px;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }
        
        /* 右侧聊天区域样式 */
        .chat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #fff;
          height: 100%;
          overflow: hidden;
        }
        
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .message {
          max-width: 85%;
          display: flex;
          flex-direction: column;
          line-height: 1.5;
          font-size: 14px;
        }
        
        .user-message {
          align-self: flex-end;
        }
        
        .assistant-message {
          align-self: flex-start;
        }
        
        .message-bubble {
          padding: 12px 16px;
          border-radius: 8px;
        }
        
        .user-message .message-bubble {
          background-color: #1a73e8;
          color: white;
        }
        
        .assistant-message .message-bubble {
          background-color: #f0f0f0;
          color: #333;
        }
        
        .message-content {
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .sending-indicator {
          align-self: center;
          color: #666;
          font-size: 14px;
          margin: 10px 0;
        }
        
        .input-area {
          border-top: 1px solid #e0e0e0;
          padding: 20px;
          background: white;
        }
        
        .AI-Models {
          display: flex;
          flex-direction: row;
          font-size: 13px;
          color: #888;
          margin-bottom: 10px;
          gap: 10px;
          justify-content: flex-start;
        }
        
        .model-description {
          border-radius: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
          text-align: center;
          padding: 4px 8px;
          border: 1px solid transparent;
          cursor: pointer;
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          width: auto;
          gap: 4px;
        }
        
        .model-description.active {
          color: #1a73e8;
          background-color: #e6f0ff;
        }
        
        .model-description.active {
          color: #1a73e8;
          background-color: #e6f0ff;
          border-color: #c2dbff;
        }
        
        .model-description:hover:not(.active) {
          background-color: #f5f5f5;
          border-color: #e0e0e0;
        }
        
        .model-name {
          font-weight: 600;
          color: #555;
          display: inline;
        }
        
        .model-info {
          color: inherit;
          font-size: 12px;
          display: inline;
        }
        
        .input-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          position: relative;
        }

        .message-input {
          width: 100%;
          height: 44px;
          min-height: 44px;
          max-height: 200px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          overflow-y: auto;
          margin-bottom: 10px;
        }

        .buttons-container {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .send-button {
          background-color: #1a73e8;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
          height: 40px;
          min-width: 80px;
        }
        
        .send-button:hover {
          background-color: #1669d8;
        }
        
        .send-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .bottom-buttons {
          display: flex;
          gap: 10px;
          margin: 10px;
          padding-bottom: 10px;
        }

        .bottom-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex: 1;
          padding: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background-color: #f5f5f5;
          color: #444;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .bottom-button:hover {
          background-color: #e6f0ff;
          color: #1a73e8;
          border-color: #c2dbff;
        }

        .bottom-button svg {
          color: inherit;
        }

        .knowledge-base-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #10b981;
          padding: 8px 12px;
          background-color: #ecfdf5;
          border-radius: 8px;
          height: 40px;
        }

        .knowledge-base-status svg {
          stroke: #10b981;
        }

        .upload-knowledge-btn {
          width: 100%;
          background-color: transparent;
          border: 1px dashed #ccc;
          border-radius: 6px;
          padding: 8px;
          color: #666;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .upload-knowledge-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
          border-color: #aaa;
        }
        
        .upload-knowledge-btn i {
          margin-right: 8px;
        }
        
        /* 模态框样式 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-container {
          background: white;
          border-radius: 8px;
          width: 480px;
          max-width: 90%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-button:hover {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .upload-option {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }
        
        .upload-option:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .upload-option h4 {
          margin: 0 0 8px;
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
        
        .upload-option p {
          margin: 0 0 12px;
          font-size: 13px;
          color: #666;
        }
        
        input[type="file"] {
          display: none;
        }
        
        .file-upload-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #1a73e8;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .file-upload-label:hover {
          background-color: #1557b0;
        }

        .file-upload-label::before {
          content: '';
          display: inline-block;
          width: 16px;
          height: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/%3E%3Cpolyline points='17 8 12 3 7 8'/%3E%3Cline x1='12' y1='3' x2='12' y2='15'/%3E%3C/svg%3E");
        }
        
        .selected-file {
          margin-top: 12px;
          font-size: 13px;
          color: #1a73e8;
          background-color: #e8f0fe;
          padding: 8px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .selected-file::before {
          content: '';
          display: inline-block;
          width: 16px;
          height: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='%231a73e8' stroke-width='2'%3E%3Cpath d='M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z'/%3E%3Cpolyline points='13 2 13 9 20 9'/%3E%3C/svg%3E");
        }
        
        .web-url-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .web-url-input:focus {
          outline: none;
          border-color: #1a73e8;
          box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 16px 20px;
          border-top: 1px solid #eee;
          gap: 12px;
        }
        
        .cancel-button, .upload-button {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cancel-button {
          background-color: white;
          border: 1px solid #ddd;
          color: #666;
        }
        
        .cancel-button:hover {
          background-color: #f5f5f5;
          border-color: #ccc;
        }
        
        .upload-button {
          background-color: #1a73e8;
          border: none;
          color: white;
        }
        
        .upload-button:hover {
          background-color: #1557b0;
        }
        
        .upload-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .new-chat-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          background-color: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          color: #444;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .new-chat-button:hover {
          background-color: #e6f0ff;
          color: #1a73e8;
          border-color: #c2dbff;
        }

        .upload-file-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          background-color: #f5f5f5;
          color: #666;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          height: 40px;
        }

        .upload-file-button:hover {
          background-color: #e6f0ff;
          color: #1a73e8;
          border-color: #c9dfff;
        }

        .upload-file-button svg {
          transition: all 0.2s ease;
        }

        .upload-file-button:hover svg {
          stroke: #1a73e8;
        }

        .manage-kb-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          background-color: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          color: #444;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .manage-kb-button:hover {
          background-color: #e6f0ff;
          color: #1a73e8;
          border-color: #c2dbff;
        }

        .manage-kb-button svg {
          transition: all 0.2s ease;
        }

        .manage-kb-button:hover svg {
          stroke: #1a73e8;
        }

        .task-status-indicator {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
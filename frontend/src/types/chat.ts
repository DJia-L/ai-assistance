// 消息角色类型
export type MessageRole = 'system' | 'user' | 'assistant';

// 消息类型
export interface Message {
  role: MessageRole;
  content: string;
  model?: string;
  timestamp?: Date;
  id?: string;
}

// AI响应类型
export interface AIResponse {
  text: string;
  model?: string;
  conversation_id?: string;
  success: boolean;
  error?: string;
  status_code?: number;
}

// 对话类型
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  model_type?: string;
  user_id?: string;
}

// 知识库类型
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  type: 'personal' | 'public';
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

// 知识库文档类型
export interface KnowledgeDocument {
  id: string;
  title: string;
  file_path?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
} 
import React, { useState } from 'react';
import Head from 'next/head';

export default function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    {role: 'system', content: '欢迎使用AI语音对话系统，点击下方麦克风按钮开始录音对话。'}
  ]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // 这里之后会实现实际的录音功能
    if (!isRecording) {
      // 开始录音的逻辑
      setMessages([...messages, {role: 'system', content: '正在录音...请说话'}]);
    } else {
      // 结束录音，发送到AI处理的逻辑
      setMessages([...messages, {role: 'user', content: '用户语音输入（示例）'}, {role: 'assistant', content: '这是AI的示例回复，在实际实现中，我们会处理用户的语音并返回AI的回答。'}]);
    }
  };

  return (
    <>
      <Head>
        <title>AI语音对话系统 - 融媒体AI助手</title>
      </Head>
      
      <div className="page-container">
        <div className="page-header">
          <h1>AI语音对话系统</h1>
          <p className="description">使用语音与AI进行实时对话，获取自然流畅的回答体验</p>
        </div>
        
        <div className="chat-container">
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
          </div>
          
          <div className="voice-controls">
            <button 
              className={`record-button ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              aria-label={isRecording ? "停止录音" : "开始录音"}
            >
              <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
            <div className="status-text">
              {isRecording ? '正在录音...' : '点击开始录音'}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        h1 {
          font-size: 32px;
          color: #1e3a8a;
          margin-bottom: 16px;
        }
        
        .description {
          font-size: 16px;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .chat-container {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          height: 70vh;
          max-height: 700px;
        }
        
        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 12px;
          animation: fadeIn 0.3s ease;
        }
        
        .message.user {
          align-self: flex-end;
          background: #e9ecfb;
          color: #1e3a8a;
          border-bottom-right-radius: 4px;
        }
        
        .message.assistant {
          align-self: flex-start;
          background: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 4px;
        }
        
        .message.system {
          align-self: center;
          background: #f8fafc;
          color: #64748b;
          font-style: italic;
          font-size: 14px;
          max-width: 90%;
          text-align: center;
          border: 1px dashed #cbd5e1;
        }
        
        .voice-controls {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f8fafc;
          border-top: 1px solid #e5e7eb;
        }
        
        .record-button {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
        }
        
        .record-button:hover {
          transform: scale(1.05);
          background: #4338ca;
        }
        
        .record-button.recording {
          background: #ef4444;
          animation: pulse 1.5s infinite;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
        }
        
        .status-text {
          margin-top: 16px;
          font-size: 14px;
          color: #6b7280;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </>
  );
} 
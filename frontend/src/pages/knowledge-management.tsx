import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  getPublicKnowledgeBases, 
  getUserKnowledgeBases, 
  KnowledgeBase,
  KnowledgeDocument,
  getKnowledgeBaseDetails,
  deleteKnowledgeBase,
  deleteKnowledgeDocument,
  createKnowledgeBase,
  uploadDocumentToKnowledgeBase
} from '../utils/api';

// 管理员知识库管理页面
export default function KnowledgeManagementPage() {
  const router = useRouter();
  const [publicKBs, setPublicKBs] = useState<KnowledgeBase[]>([]);
  const [personalKBs, setPersonalKBs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [showNewKBForm, setShowNewKBForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newKBName, setNewKBName] = useState('');
  const [newKBDesc, setNewKBDesc] = useState('');
  const [newKBType, setNewKBType] = useState<'public' | 'personal'>('public');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('');

  // 检查用户是否登录及是否为管理员
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      const userObj = JSON.parse(user);
      setIsAdmin(userObj.is_admin || false);
      setUserId(userObj.id);
      
      if (!userObj.is_admin) {
        router.push('/my-knowledge');
      }
    } catch (err) {
      router.push('/login');
    }
  }, [router]);

  // 加载知识库
  useEffect(() => {
    if (!userId) return;
    
    const loadKnowledgeBases = async () => {
      setLoading(true);
      try {
        const publicData = await getPublicKnowledgeBases();
        setPublicKBs(publicData);
        
        // 管理员可以看到所有用户的个人知识库
        if (isAdmin) {
          const personalData = await getUserKnowledgeBases(userId);
          setPersonalKBs(personalData);
        }
      } catch (err) {
        console.error('加载知识库失败:', err);
        setError('加载知识库失败');
      } finally {
        setLoading(false);
      }
    };
    
    loadKnowledgeBases();
  }, [userId, isAdmin]);

  // 选择知识库
  const selectKnowledgeBase = async (kb: KnowledgeBase) => {
    setSelectedKB(kb);
    try {
      const details = await getKnowledgeBaseDetails(kb.id);
      setDocuments(details.documents);
    } catch (err) {
      console.error('加载知识库详情失败:', err);
      setError('加载知识库详情失败');
    }
  };

  // 删除知识库
  const handleDeleteKB = async (kb: KnowledgeBase) => {
    if (!confirm(`确定要删除知识库"${kb.name}"吗？此操作无法撤销。`)) {
      return;
    }
    
    try {
      await deleteKnowledgeBase(kb.id);
      if (kb.type === 'public') {
        setPublicKBs(prevKBs => prevKBs.filter(k => k.id !== kb.id));
      } else {
        setPersonalKBs(prevKBs => prevKBs.filter(k => k.id !== kb.id));
      }
      
      if (selectedKB && selectedKB.id === kb.id) {
        setSelectedKB(null);
        setDocuments([]);
      }
    } catch (err) {
      console.error('删除知识库失败:', err);
      setError('删除知识库失败');
    }
  };

  // 删除文档
  const handleDeleteDocument = async (doc: KnowledgeDocument) => {
    if (!confirm(`确定要删除文档"${doc.title}"吗？此操作无法撤销。`)) {
      return;
    }
    
    try {
      await deleteKnowledgeDocument(doc.id);
      setDocuments(prevDocs => prevDocs.filter(d => d.id !== doc.id));
    } catch (err) {
      console.error('删除文档失败:', err);
      setError('删除文档失败');
    }
  };

  // 创建新知识库
  const handleCreateKB = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKBName.trim()) {
      setError('知识库名称不能为空');
      return;
    }
    
    try {
      const newKB = await createKnowledgeBase({
        name: newKBName,
        description: newKBDesc,
        type: newKBType
      });
      
      if (newKBType === 'public') {
        setPublicKBs(prevKBs => [...prevKBs, newKB]);
      } else {
        setPersonalKBs(prevKBs => [...prevKBs, newKB]);
      }
      
      setShowNewKBForm(false);
      setNewKBName('');
      setNewKBDesc('');
      setNewKBType('public');
    } catch (err) {
      console.error('创建知识库失败:', err);
      setError('创建知识库失败');
    }
  };

  // 上传文档
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedKB) {
      setError('请先选择一个知识库');
      return;
    }
    
    if (!uploadFile) {
      setError('请选择要上传的文件');
      return;
    }
    
    if (!uploadTitle.trim()) {
      setError('请输入文档标题');
      return;
    }
    
    try {
      const newDoc = await uploadDocumentToKnowledgeBase(
        selectedKB.id,
        uploadTitle,
        uploadFile
      );
      
      setDocuments(prevDocs => [...prevDocs, newDoc]);
      setShowUploadForm(false);
      setUploadFile(null);
      setUploadTitle('');
    } catch (err) {
      console.error('上传文档失败:', err);
      setError('上传文档失败');
    }
  };

  return (
    <div className="knowledge-management-page">
      <h1>知识库管理</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="knowledge-management-content">
        <div className="knowledge-base-list">
          <div className="section">
            <h2>公共知识库</h2>
            <button onClick={() => {
              setNewKBType('public');
              setShowNewKBForm(true);
            }}>创建新公共知识库</button>
            
            {loading ? (
              <p>加载中...</p>
            ) : (
              <ul>
                {publicKBs.map(kb => (
                  <li key={kb.id} className={selectedKB?.id === kb.id ? 'selected' : ''}>
                    <span onClick={() => selectKnowledgeBase(kb)}>{kb.name}</span>
                    <button onClick={() => handleDeleteKB(kb)}>删除</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="section">
            <h2>个人知识库</h2>
            <button onClick={() => {
              setNewKBType('personal');
              setShowNewKBForm(true);
            }}>创建新个人知识库</button>
            
            {loading ? (
              <p>加载中...</p>
            ) : (
              <ul>
                {personalKBs.map(kb => (
                  <li key={kb.id} className={selectedKB?.id === kb.id ? 'selected' : ''}>
                    <span onClick={() => selectKnowledgeBase(kb)}>{kb.name}</span>
                    <button onClick={() => handleDeleteKB(kb)}>删除</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="knowledge-base-details">
          {selectedKB ? (
            <>
              <h2>{selectedKB.name}</h2>
              <p>{selectedKB.description || '无描述'}</p>
              <p>类型: {selectedKB.type === 'public' ? '公共' : '个人'}</p>
              
              <div className="documents-section">
                <h3>文档列表</h3>
                <button onClick={() => setShowUploadForm(true)}>上传新文档</button>
                
                {documents.length === 0 ? (
                  <p>暂无文档</p>
                ) : (
                  <ul>
                    {documents.map(doc => (
                      <li key={doc.id}>
                        <span>{doc.title}</span>
                        <span className="document-status">{doc.status}</span>
                        <button onClick={() => handleDeleteDocument(doc)}>删除</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p>请选择一个知识库查看详情</p>
          )}
        </div>
      </div>
      
      {/* 创建知识库表单 */}
      {showNewKBForm && (
        <div className="modal" role="dialog" aria-labelledby="new-kb-title">
          <div className="modal-content">
            <h2 id="new-kb-title">创建新知识库</h2>
            <form onSubmit={handleCreateKB}>
              <div className="form-group">
                <label htmlFor="kb-name">名称:</label>
                <input
                  id="kb-name"
                  type="text"
                  value={newKBName}
                  onChange={e => setNewKBName(e.target.value)}
                  required
                  aria-required="true"
                  placeholder="输入知识库名称"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="kb-desc">描述:</label>
                <textarea
                  id="kb-desc"
                  value={newKBDesc}
                  onChange={e => setNewKBDesc(e.target.value)}
                  placeholder="输入知识库描述（可选）"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="kb-type">类型:</label>
                <select
                  id="kb-type"
                  value={newKBType}
                  onChange={e => setNewKBType(e.target.value as 'public' | 'personal')}
                  aria-label="知识库类型"
                >
                  <option value="public">公共</option>
                  <option value="personal">个人</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" aria-label="创建知识库">创建</button>
                <button 
                  type="button" 
                  onClick={() => setShowNewKBForm(false)}
                  aria-label="取消创建"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 上传文档表单 */}
      {showUploadForm && (
        <div className="modal" role="dialog" aria-labelledby="upload-doc-title">
          <div className="modal-content">
            <h2 id="upload-doc-title">上传新文档</h2>
            <form onSubmit={handleUploadDocument}>
              <div className="form-group">
                <label htmlFor="doc-title">标题:</label>
                <input
                  id="doc-title"
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  required
                  aria-required="true"
                  placeholder="输入文档标题"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="doc-file">文件:</label>
                <input
                  id="doc-file"
                  type="file"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" aria-label="上传文档">上传</button>
                <button 
                  type="button" 
                  onClick={() => setShowUploadForm(false)}
                  aria-label="取消上传"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .knowledge-management-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .knowledge-management-content {
          display: flex;
          gap: 20px;
        }
        
        .knowledge-base-list {
          flex: 1;
          border-right: 1px solid #e0e0e0;
          padding-right: 20px;
        }
        
        .knowledge-base-details {
          flex: 2;
          padding-left: 20px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        h2 {
          margin-bottom: 15px;
          color: #333;
        }
        
        button {
          background-color: #1a73e8;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 15px;
        }
        
        button:hover {
          background-color: #1557b0;
        }
        
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        li {
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        li.selected {
          background-color: #e3f2fd;
        }
        
        li span {
          cursor: pointer;
          flex: 1;
        }
        
        .document-status {
          font-size: 12px;
          color: #757575;
          flex: 0 0 100px;
          text-align: center;
        }
        
        .modal {
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
        
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 500px;
          max-width: 90%;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .form-group textarea {
          height: 100px;
          resize: vertical;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .form-actions button[type="button"] {
          background-color: #f5f5f5;
          color: #333;
        }
      `}</style>
    </div>
  );
} 
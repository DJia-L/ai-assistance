import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
  getUserKnowledgeBases, 
  KnowledgeBase,
  KnowledgeDocument,
  getKnowledgeBaseDetails,
  deleteKnowledgeBase,
  deleteKnowledgeDocument,
  createKnowledgeBase,
  uploadDocumentToKnowledgeBase
} from '../utils/api';
import ErrorNotification from '../components/ErrorNotification';

// 文档列表组件，使用React.memo提高性能
const DocumentList = React.memo(({ 
  documents, 
  onDelete 
}: { 
  documents: KnowledgeDocument[], 
  onDelete: (doc: KnowledgeDocument) => void 
}) => {
  if (documents.length === 0) {
    return <p>暂无文档</p>;
  }
  
  return (
    <ul>
      {documents.map(doc => (
        <li key={doc.id}>
          <span>{doc.title}</span>
          <span className="document-status">{doc.status}</span>
          <button 
            onClick={() => onDelete(doc)}
            aria-label={`删除文档 ${doc.title}`}
          >
            删除
          </button>
        </li>
      ))}
    </ul>
  );
});

// 知识库列表组件，使用React.memo提高性能
const KnowledgeBaseList = React.memo(({ 
  knowledgeBases,
  selectedKBId,
  onSelect,
  onDelete,
  loading
}: { 
  knowledgeBases: KnowledgeBase[],
  selectedKBId?: string,
  onSelect: (kb: KnowledgeBase) => void,
  onDelete: (kb: KnowledgeBase) => void,
  loading: boolean
}) => {
  if (loading) {
    return <p>加载中...</p>;
  }
  
  if (knowledgeBases.length === 0) {
    return <p>您还没有创建任何知识库</p>;
  }
  
  return (
    <ul>
      {knowledgeBases.map(kb => (
        <li key={kb.id} className={selectedKBId === kb.id ? 'selected' : ''}>
          <span onClick={() => onSelect(kb)}>{kb.name}</span>
          <button 
            onClick={() => onDelete(kb)}
            aria-label={`删除知识库 ${kb.name}`}
          >
            删除
          </button>
        </li>
      ))}
    </ul>
  );
});

// 用户的知识库管理页面
export default function MyKnowledgePage() {
  const router = useRouter();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [showNewKBForm, setShowNewKBForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newKBName, setNewKBName] = useState('');
  const [newKBDesc, setNewKBDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [userId, setUserId] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // 检查用户是否登录
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      const userObj = JSON.parse(user);
      setUserId(userObj.id);
    } catch (err) {
      router.push('/login');
    }
  }, [router]);

  // 加载用户的知识库
  useEffect(() => {
    if (!userId) return;
    
    const loadKnowledgeBases = async () => {
      setLoading(true);
      setError('');
      try {
        console.log(`正在加载用户 ${userId} 的知识库列表`);
        const data = await getUserKnowledgeBases(userId);
        console.log(`成功加载 ${data.length} 个知识库`);
        setKnowledgeBases(data);
        
        // 如果有知识库，自动选择第一个
        if (data.length > 0 && !selectedKB) {
          console.log(`自动选择第一个知识库: ${data[0].name}`);
          selectKnowledgeBase(data[0]);
        }
      } catch (err) {
        console.error('加载知识库失败:', err);
        setError(err instanceof Error ? err.message : '加载知识库失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    loadKnowledgeBases();
  }, [userId, selectedKB, selectKnowledgeBase]);

  // 选择知识库 - 使用useCallback优化
  const selectKnowledgeBase = useCallback(async (kb: KnowledgeBase) => {
    setSelectedKB(kb);
    setError('');
    
    // 添加文档加载状态
    setDocuments([]);
    const docLoadingState: KnowledgeDocument = {
      id: 'loading',
      title: '正在加载文档...',
      file_path: '',
      kb_id: kb.id,
      status: 'loading',
      created_at: '',
      updated_at: ''
    };
    setDocuments([docLoadingState]);
    
    try {
      console.log(`正在加载知识库详情: ${kb.id} (${kb.name})`);
      const details = await getKnowledgeBaseDetails(kb.id);
      console.log(`成功加载 ${details.documents.length} 个文档`);
      setDocuments(details.documents);
    } catch (err) {
      console.error('加载知识库详情失败:', err);
      setError(err instanceof Error ? err.message : '加载知识库详情失败，请稍后重试');
      setDocuments([]);
    }
  }, []);

  // 删除知识库 - 使用useCallback优化
  const handleDeleteKB = useCallback(async (kb: KnowledgeBase) => {
    if (!confirm(`确定要删除知识库"${kb.name}"吗？此操作无法撤销。`)) {
      return;
    }
    
    try {
      await deleteKnowledgeBase(kb.id);
      setKnowledgeBases(prevKBs => prevKBs.filter(k => k.id !== kb.id));
      
      if (selectedKB && selectedKB.id === kb.id) {
        setSelectedKB(null);
        setDocuments([]);
      }
    } catch (err) {
      console.error('删除知识库失败:', err);
      setError('删除知识库失败');
    }
  }, [selectedKB]);

  // 删除文档 - 使用useCallback优化
  const handleDeleteDocument = useCallback(async (doc: KnowledgeDocument) => {
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
  }, []);

  // 创建新知识库 - 使用useCallback优化
  const handleCreateKB = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKBName.trim()) {
      setError('知识库名称不能为空');
      return;
    }
    
    try {
      const newKB = await createKnowledgeBase({
        name: newKBName,
        description: newKBDesc,
        type: 'personal'  // 用户只能创建个人知识库
      });
      
      setKnowledgeBases(prevKBs => [...prevKBs, newKB]);
      setShowNewKBForm(false);
      setNewKBName('');
      setNewKBDesc('');
    } catch (err) {
      console.error('创建知识库失败:', err);
      setError('创建知识库失败');
    }
  }, [newKBName, newKBDesc]);

  // 上传文档到知识库
  const handleUploadDocument = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedKB) {
      setError('请先选择知识库');
      return;
    }
    
    if (!uploadTitle.trim()) {
      setError('文档标题不能为空');
      return;
    }
    
    if (!uploadFile) {
      setError('请选择要上传的文件');
      return;
    }
    
    // 验证文件类型
    const supportedTypes = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const fileExt = uploadFile.name.substring(uploadFile.name.lastIndexOf('.')).toLowerCase();
    if (!supportedTypes.includes(fileExt)) {
      setError(`不支持的文件类型：${fileExt}。请上传 PDF、Word 或文本文件。`);
      return;
    }
    
    // 验证文件大小
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (uploadFile.size > maxSize) {
      setError(`文件过大：${(uploadFile.size / 1024 / 1024).toFixed(2)}MB。请上传小于 20MB 的文件。`);
      return;
    }
    
    // 重置错误和进度
    setError('');
    setUploadProgress(0);
    
    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const nextProgress = prev + Math.random() * 15;
          return nextProgress >= 90 ? 90 : nextProgress;
        });
      }, 500);
      
      console.log(`开始上传文档到知识库: ${selectedKB.id}, 标题: ${uploadTitle}, 文件: ${uploadFile.name}`);
      
      // 执行上传
      await uploadDocumentToKnowledgeBase(selectedKB.id, uploadTitle, uploadFile);
      
      // 上传完成
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 重置表单
      setUploadTitle('');
      setUploadFile(null);
      setShowUploadForm(false);
      
      // 重新加载文档列表
      const details = await getKnowledgeBaseDetails(selectedKB.id);
      setDocuments(details.documents);
      
      console.log('文档上传成功');
    } catch (err) {
      console.error('上传文档失败:', err);
      setError(err instanceof Error ? err.message : '上传文档失败，请稍后重试');
    } finally {
      // 确保进度条重置
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [selectedKB, uploadTitle, uploadFile]);

  // 使用useMemo缓存知识库列表项
  const selectedKBId = useMemo(() => selectedKB?.id, [selectedKB]);

  return (
    <div className="my-knowledge-page">
      <h1>我的知识库</h1>
      
      {/* 显示错误信息 */}
      <ErrorNotification 
        message={error} 
        onClose={() => setError('')}
        type="error"
      />
      
      {uploadProgress > 0 && (
        <div className="upload-progress">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          <div className="progress-text">{uploadProgress}%</div>
        </div>
      )}
      
      <div className="my-knowledge-content">
        <div className="knowledge-base-list">
          <h2>我的知识库列表</h2>
          <button 
            onClick={() => setShowNewKBForm(true)}
            aria-label="创建新知识库"
          >
            创建新知识库
          </button>
          
          <KnowledgeBaseList 
            knowledgeBases={knowledgeBases}
            selectedKBId={selectedKBId}
            onSelect={selectKnowledgeBase}
            onDelete={handleDeleteKB}
            loading={loading}
          />
        </div>
        
        <div className="knowledge-base-details">
          {selectedKB ? (
            <>
              <h2>{selectedKB.name}</h2>
              <p>{selectedKB.description || '无描述'}</p>
              
              <div className="documents-section">
                <h3>文档列表</h3>
                <button 
                  onClick={() => setShowUploadForm(true)}
                  aria-label="上传新文档"
                >
                  上传新文档
                </button>
                
                <DocumentList 
                  documents={documents}
                  onDelete={handleDeleteDocument}
                />
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
        .my-knowledge-page {
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
        
        .upload-progress {
          margin-bottom: 20px;
          background-color: #f5f5f5;
          border-radius: 4px;
          overflow: hidden;
          height: 20px;
          position: relative;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #1a73e8;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-size: 12px;
        }
        
        .my-knowledge-content {
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
        .form-group textarea {
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
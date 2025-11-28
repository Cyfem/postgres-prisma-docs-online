'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { App as AntdApp, Modal, Tag as AntTag } from 'antd'
import TiptapEditor from '@/components/TiptapEditor'
import VersionHistory from '@/components/VersionHistory'
import TagManager from '@/components/TagManager'
import DocumentTagSelector from '@/components/DocumentTagSelector'

interface Document {
  id: string
  title: string
  content?: string
  createdAt: string
  updatedAt: string
  isPublic?: boolean
  shareToken?: string | null
  tags?: Array<{
    tag: {
      id: string
      name: string
      color: string
    }
  }>
}

interface Tag {
  id: string
  name: string
  color: string
}

export default function AppPage() {
  const router = useRouter()
  const { message, modal } = AntdApp.useApp()
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [sharing, setSharing] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)
  const [showDocumentTags, setShowDocumentTags] = useState(false)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // 加载文档列表
  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      if (res.ok) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 加载所有标签
  const loadTags = useCallback(async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (res.ok) {
        setAllTags(data.tags)
      }
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }, [])

  // 加载单个文档
  const loadDocument = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`)
      const data = await res.json()
      if (res.ok) {
        setCurrentDoc(data.document)
        setTitle(data.document.title)
        setContent(data.document.content)
      }
    } catch (error) {
      console.error('Failed to load document:', error)
    }
  }, [])

  // 创建新文档
  const createDocument = async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '无标题文档' }),
      })
      const data = await res.json()
      if (res.ok) {
        await loadDocuments()
        setCurrentDoc(data.document)
        setTitle(data.document.title)
        setContent('')
      }
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }

  // 保存文档
  const saveDocument = useCallback(async () => {
    if (!currentDoc) return

    setSaving(true)
    try {
      const res = await fetch(`/api/documents/${currentDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (res.ok) {
        setLastSaved(new Date())
        await loadDocuments()
      }
    } catch (error) {
      console.error('Failed to save document:', error)
    } finally {
      setSaving(false)
    }
  }, [currentDoc, title, content, loadDocuments])

  // 自动保存（每5秒）
  useEffect(() => {
    if (!currentDoc) return

    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // 设置新的定时器
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument()
    }, 5000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [title, content, currentDoc, saveDocument])

  // 删除文档
  const deleteDocument = async (id: string) => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这个文档吗？此操作无法撤销。',
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch(`/api/documents/${id}`, {
            method: 'DELETE',
          })
          if (res.ok) {
            message.success('文档已删除')
            await loadDocuments()
            if (currentDoc?.id === id) {
              setCurrentDoc(null)
              setTitle('')
              setContent('')
            }
          } else {
            message.error('删除文档失败')
          }
        } catch (error) {
          console.error('Failed to delete document:', error)
          message.error('删除文档失败，请稍后重试')
        }
      },
    })
  }

  // 生成分享链接
  const handleShare = async () => {
    if (!currentDoc) return

    setSharing(true)
    try {
      const res = await fetch(`/api/documents/${currentDoc.id}/share`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setShareUrl(data.shareUrl)
        setShowShareModal(true)
        // 刷新文档信息
        await loadDocument(currentDoc.id)
      } else {
        message.error(data.error || '分享失败')
      }
    } catch (error) {
      console.error('Failed to share document:', error)
      message.error('分享失败，请稍后重试')
    } finally {
      setSharing(false)
    }
  }

  // 取消分享
  const handleUnshare = async () => {
    if (!currentDoc) return

    modal.confirm({
      title: '取消分享',
      content: '确定要取消分享吗？取消后之前的分享链接将失效。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch(`/api/documents/${currentDoc.id}/share`, {
            method: 'DELETE',
          })
          if (res.ok) {
            setShowShareModal(false)
            setShareUrl('')
            // 刷新文档信息
            await loadDocument(currentDoc.id)
            message.success('已取消分享')
          } else {
            message.error('取消分享失败')
          }
        } catch (error) {
          console.error('Failed to unshare document:', error)
          message.error('取消分享失败，请稍后重试')
        }
      },
    })
  }

  // 复制分享链接
  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      message.success('分享链接已复制到剪贴板')
    }
  }

  // 保存版本快照
  const handleSaveVersion = async () => {
    if (!currentDoc) return

    try {
      const res = await fetch(`/api/documents/${currentDoc.id}/versions`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        message.success('版本已保存')
      } else {
        message.error(data.error || '保存版本失败')
      }
    } catch (error) {
      console.error('Failed to save version:', error)
      message.error('保存版本失败')
    }
  }

  // 恢复版本后刷新文档
  const handleVersionRestore = async () => {
    if (currentDoc) {
      await loadDocument(currentDoc.id)
    }
  }

  // 登出
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    loadDocuments()
    loadTags()
  }, [loadDocuments, loadTags])

  // 筛选后的文档列表
  const filteredDocuments = selectedTagId
    ? documents.filter((doc) =>
        doc.tags?.some((dt) => dt.tag.id === selectedTagId)
      )
    : documents

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左侧边栏 - 文档列表 */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b space-y-2">
          <button
            onClick={createDocument}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + 新建文档
          </button>
          <button
            onClick={() => setShowTagManager(true)}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            标签管理
          </button>
        </div>

        {/* 标签筛选 */}
        <div className="p-4 border-b">
          <div className="text-xs text-gray-500 mb-2">按标签筛选</div>
          <div className="flex flex-wrap gap-2">
            <AntTag
              className="cursor-pointer"
              color={selectedTagId === null ? 'blue' : 'default'}
              onClick={() => setSelectedTagId(null)}
            >
              全部
            </AntTag>
            {allTags.map((tag) => (
              <AntTag
                key={tag.id}
                className="cursor-pointer"
                color={selectedTagId === tag.id ? tag.color : 'default'}
                onClick={() => setSelectedTagId(tag.id)}
              >
                {tag.name}
              </AntTag>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                currentDoc?.id === doc.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => loadDocument(doc.id)}
            >
              <h3 className="font-medium truncate">{doc.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
              </p>
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.map((dt) => (
                    <AntTag
                      key={dt.tag.id}
                      color={dt.tag.color}
                      className="text-xs m-0"
                    >
                      {dt.tag.name}
                    </AntTag>
                  ))}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteDocument(doc.id)
                }}
                className="text-xs text-red-600 hover:text-red-800 mt-2"
              >
                删除
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            登出
          </button>
        </div>
      </div>

      {/* 右侧内容区 - 编辑器 */}
      <div className="flex-1 flex flex-col">
        {currentDoc ? (
          <>
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none focus:outline-none flex-1"
                placeholder="无标题文档"
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDocumentTags(true)}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
                >
                  文档标签
                </button>
                <button
                  onClick={() => setShowVersionHistory(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  版本历史
                </button>
                <button
                  onClick={handleSaveVersion}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                >
                  保存版本
                </button>
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {currentDoc.isPublic ? '已分享' : '分享'}
                </button>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  {saving && <span>保存中...</span>}
                  {!saving && lastSaved && (
                    <span>
                      上次保存: {lastSaved.toLocaleTimeString('zh-CN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <TiptapEditor content={content} onChange={setContent} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-xl mb-4">选择一个文档或创建新文档</p>
              <button
                onClick={createDocument}
                className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建第一个文档
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 分享模态框 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">分享文档</h2>
            <p className="text-gray-600 mb-4">
              任何拥有此链接的人都可以查看这个文档
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={copyShareUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                复制
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
              <button
                onClick={handleUnshare}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                取消分享
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 版本历史模态框 */}
      {currentDoc && (
        <VersionHistory
          documentId={currentDoc.id}
          visible={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRestore={handleVersionRestore}
        />
      )}

      {/* 标签管理器 */}
      <TagManager
        visible={showTagManager}
        onClose={() => setShowTagManager(false)}
        onTagsChange={() => {
          loadTags()
          loadDocuments()
        }}
      />

      {/* 文档标签选择器 */}
      {currentDoc && (
        <DocumentTagSelector
          documentId={currentDoc.id}
          visible={showDocumentTags}
          onClose={() => setShowDocumentTags(false)}
          onTagsChange={() => {
            loadDocument(currentDoc.id)
            loadDocuments()
          }}
        />
      )}
    </div>
  )
}

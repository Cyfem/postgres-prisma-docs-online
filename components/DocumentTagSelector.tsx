'use client'

import { useState, useEffect } from 'react'
import { Modal, Tag as AntTag, Checkbox, Empty, Spin, App as AntdApp } from 'antd'
import { TagsOutlined } from '@ant-design/icons'

interface Tag {
  id: string
  name: string
  color: string
}

interface DocumentTagSelectorProps {
  documentId: string
  visible: boolean
  onClose: () => void
  onTagsChange: () => void
}

export default function DocumentTagSelector({
  documentId,
  visible,
  onClose,
  onTagsChange,
}: DocumentTagSelectorProps) {
  const { message } = AntdApp.useApp()
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [documentTags, setDocumentTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)

  // 加载所有标签
  const loadAllTags = async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (res.ok) {
        setAllTags(data.tags)
      }
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  // 加载文档已有的标签
  const loadDocumentTags = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/tags`)
      const data = await res.json()
      if (res.ok) {
        setDocumentTags(data.tags)
      }
    } catch (error) {
      console.error('Failed to load document tags:', error)
    } finally {
      setLoading(false)
    }
  }

  // 切换标签
  const handleToggleTag = async (tagId: string, checked: boolean) => {
    try {
      if (checked) {
        // 添加标签
        const res = await fetch(`/api/documents/${documentId}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId }),
        })
        if (res.ok) {
          message.success('标签已添加')
          await loadDocumentTags()
          onTagsChange()
        } else {
          const data = await res.json()
          message.error(data.error || '添加标签失败')
        }
      } else {
        // 移除标签
        const res = await fetch(
          `/api/documents/${documentId}/tags?tagId=${tagId}`,
          {
            method: 'DELETE',
          }
        )
        if (res.ok) {
          message.success('标签已移除')
          await loadDocumentTags()
          onTagsChange()
        } else {
          message.error('移除标签失败')
        }
      }
    } catch (error) {
      console.error('Failed to toggle tag:', error)
      message.error('操作失败')
    }
  }

  useEffect(() => {
    if (visible) {
      loadAllTags()
      loadDocumentTags()
    }
  }, [visible, documentId])

  const isTagSelected = (tagId: string) => {
    return documentTags.some((t) => t.id === tagId)
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <TagsOutlined />
          文档标签
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Spin spinning={loading}>
        {allTags.length === 0 ? (
          <Empty
            description="暂无标签，请先创建标签"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="space-y-2">
            {allTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded"
              >
                <Checkbox
                  checked={isTagSelected(tag.id)}
                  onChange={(e) => handleToggleTag(tag.id, e.target.checked)}
                >
                  <AntTag color={tag.color}>{tag.name}</AntTag>
                </Checkbox>
              </div>
            ))}
          </div>
        )}
      </Spin>
    </Modal>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Modal, List, Button, Empty, Spin, App as AntdApp } from 'antd'
import { HistoryOutlined, RollbackOutlined, EyeOutlined } from '@ant-design/icons'
import TiptapEditor from './TiptapEditor'

interface Version {
  id: string
  title: string
  content?: string
  createdAt: string
}

interface VersionHistoryProps {
  documentId: string
  visible: boolean
  onClose: () => void
  onRestore: () => void
}

export default function VersionHistory({
  documentId,
  visible,
  onClose,
  onRestore,
}: VersionHistoryProps) {
  const { message, modal } = AntdApp.useApp()
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // 加载版本列表
  const loadVersions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/versions`)
      const data = await res.json()
      if (res.ok) {
        setVersions(data.versions)
      } else {
        message.error(data.error || '加载版本列表失败')
      }
    } catch (error) {
      console.error('Failed to load versions:', error)
      message.error('加载版本列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 预览版本
  const handlePreview = async (versionId: string) => {
    try {
      const res = await fetch(
        `/api/documents/${documentId}/versions/${versionId}`
      )
      const data = await res.json()
      if (res.ok) {
        setPreviewVersion(data.version)
        setShowPreview(true)
      } else {
        message.error(data.error || '加载版本详情失败')
      }
    } catch (error) {
      console.error('Failed to preview version:', error)
      message.error('加载版本详情失败')
    }
  }

  // 恢复版本
  const handleRestore = (versionId: string, versionTitle: string) => {
    modal.confirm({
      title: '恢复版本',
      content: `确定要恢复到版本"${versionTitle}"吗？当前内容将被保存为新版本。`,
      okText: '恢复',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(
            `/api/documents/${documentId}/versions/${versionId}`,
            { method: 'POST' }
          )
          const data = await res.json()
          if (res.ok) {
            message.success('版本已恢复')
            onRestore()
            onClose()
          } else {
            message.error(data.error || '恢复版本失败')
          }
        } catch (error) {
          console.error('Failed to restore version:', error)
          message.error('恢复版本失败')
        }
      },
    })
  }

  useEffect(() => {
    if (visible) {
      loadVersions()
    }
  }, [visible, documentId])

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined />
            版本历史
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <Spin spinning={loading}>
          {versions.length === 0 ? (
            <Empty
              description="暂无历史版本"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={versions}
              renderItem={(version) => (
                <List.Item
                  actions={[
                    <Button
                      key="preview"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(version.id)}
                    >
                      预览
                    </Button>,
                    <Button
                      key="restore"
                      type="link"
                      icon={<RollbackOutlined />}
                      onClick={() => handleRestore(version.id, version.title)}
                    >
                      恢复
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={version.title}
                    description={new Date(version.createdAt).toLocaleString(
                      'zh-CN'
                    )}
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Modal>

      {/* 预览模态框 */}
      <Modal
        title={previewVersion?.title}
        open={showPreview}
        onCancel={() => {
          setShowPreview(false)
          setPreviewVersion(null)
        }}
        footer={null}
        width={800}
      >
        {previewVersion && (
          <div className="max-h-[600px] overflow-y-auto">
            <TiptapEditor
              content={previewVersion.content || ''}
              onChange={() => {}}
              editable={false}
            />
          </div>
        )}
      </Modal>
    </>
  )
}

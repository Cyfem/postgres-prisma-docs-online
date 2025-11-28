'use client'

import { useState, useEffect } from 'react'
import { Modal, List, Button, Input, Form, App as AntdApp, Popconfirm, Tag as AntTag } from 'antd'
import { TagOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

interface Tag {
  id: string
  name: string
  color: string
  _count?: {
    documents: number
  }
}

interface TagManagerProps {
  visible: boolean
  onClose: () => void
  onTagsChange: () => void
}

const PRESET_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#fbbf24', // yellow
  '#a3e635', // lime
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#3b82f6', // blue
  '#a78bfa', // purple
  '#ec4899', // pink
  '#94a3b8', // gray
]

export default function TagManager({
  visible,
  onClose,
  onTagsChange,
}: TagManagerProps) {
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[6])

  // 加载标签列表
  const loadTags = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (res.ok) {
        setTags(data.tags)
      } else {
        message.error(data.error || '加载标签失败')
      }
    } catch (error) {
      console.error('Failed to load tags:', error)
      message.error('加载标签失败')
    } finally {
      setLoading(false)
    }
  }

  // 创建标签
  const handleCreate = async (values: { name: string }) => {
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          color: selectedColor,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        message.success('标签已创建')
        form.resetFields()
        setSelectedColor(PRESET_COLORS[6])
        loadTags()
        onTagsChange()
      } else {
        message.error(data.error || '创建标签失败')
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
      message.error('创建标签失败')
    }
  }

  // 编辑标签
  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setSelectedColor(tag.color)
    form.setFieldsValue({ name: tag.name })
  }

  // 更新标签
  const handleUpdate = async (values: { name: string }) => {
    if (!editingTag) return

    try {
      const res = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          color: selectedColor,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        message.success('标签已更新')
        setEditingTag(null)
        form.resetFields()
        setSelectedColor(PRESET_COLORS[6])
        loadTags()
        onTagsChange()
      } else {
        message.error(data.error || '更新标签失败')
      }
    } catch (error) {
      console.error('Failed to update tag:', error)
      message.error('更新标签失败')
    }
  }

  // 删除标签
  const handleDelete = async (tagId: string) => {
    try {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        message.success('标签已删除')
        loadTags()
        onTagsChange()
      } else {
        message.error('删除标签失败')
      }
    } catch (error) {
      console.error('Failed to delete tag:', error)
      message.error('删除标签失败')
    }
  }

  const handleSubmit = (values: { name: string }) => {
    if (editingTag) {
      handleUpdate(values)
    } else {
      handleCreate(values)
    }
  }

  useEffect(() => {
    if (visible) {
      loadTags()
    }
  }, [visible])

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <TagOutlined />
          标签管理
        </div>
      }
      open={visible}
      onCancel={() => {
        onClose()
        setEditingTag(null)
        form.resetFields()
        setSelectedColor(PRESET_COLORS[6])
      }}
      footer={null}
      width={600}
    >
      <div className="mb-4">
        <Form form={form} onFinish={handleSubmit} layout="inline">
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
            className="flex-1"
          >
            <Input
              placeholder="标签名称"
              prefix={<TagOutlined />}
              maxLength={30}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={editingTag ? <EditOutlined /> : <PlusOutlined />}
            >
              {editingTag ? '更新' : '创建'}
            </Button>
          </Form.Item>
          {editingTag && (
            <Form.Item>
              <Button
                onClick={() => {
                  setEditingTag(null)
                  form.resetFields()
                  setSelectedColor(PRESET_COLORS[6])
                }}
              >
                取消
              </Button>
            </Form.Item>
          )}
        </Form>

        {/* 颜色选择器 */}
        <div className="mt-3 flex gap-2 items-center">
          <span className="text-sm text-gray-600">颜色:</span>
          <div className="flex gap-2">
            {PRESET_COLORS.map((color) => (
              <div
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                  selectedColor === color ? 'border-gray-900' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <List
        loading={loading}
        dataSource={tags}
        renderItem={(tag) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(tag)}
              >
                编辑
              </Button>,
              <Popconfirm
                key="delete"
                title="确定删除此标签吗？"
                description="删除后将从所有文档中移除"
                onConfirm={() => handleDelete(tag.id)}
                okText="删除"
                cancelText="取消"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <AntTag color={tag.color} className="m-0">
                  {tag.name}
                </AntTag>
              }
              description={`${tag._count?.documents || 0} 个文档`}
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}

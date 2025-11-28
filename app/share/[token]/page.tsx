'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import TiptapEditor from '@/components/TiptapEditor'
import Link from 'next/link'

interface Document {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function SharePage() {
  const params = useParams()
  const token = params.token as string
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const res = await fetch(`/api/share/${token}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || '文档不存在')
        }

        setDocument(data.document)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDocument()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || '文档不存在'}
          </h1>
          <p className="text-gray-600 mb-6">
            该文档可能已被删除或未公开分享
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 返回首页
          </Link>
          <div className="text-sm text-gray-500">
            由{' '}
            <span className="font-medium text-gray-900">
              {document.user.name || document.user.email}
            </span>{' '}
            分享
          </div>
        </div>
      </div>

      {/* 文档内容 */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {document.title}
            </h1>
            <p className="text-sm text-gray-500">
              最后更新: {new Date(document.updatedAt).toLocaleString('zh-CN')}
            </p>
          </div>
          <div className="p-6">
            <TiptapEditor
              content={document.content}
              onChange={() => {}}
              editable={false}
            />
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>这是一个只读文档</p>
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
          >
            注册账号创建你自己的文档
          </Link>
        </div>
      </div>
    </div>
  )
}

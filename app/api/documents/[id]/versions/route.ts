import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// 获取文档的所有历史版本
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params

    // 检查文档是否属于当前用户
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!document) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 })
    }

    // 获取历史版本列表
    const versions = await prisma.documentVersion.findMany({
      where: {
        documentId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Get document versions error:', error)
    return NextResponse.json(
      { error: '获取版本历史失败' },
      { status: 500 }
    )
  }
}

// 手动创建版本快照
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params

    // 检查文档是否属于当前用户
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!document) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 })
    }

    // 创建版本快照
    const version = await prisma.documentVersion.create({
      data: {
        documentId: id,
        title: document.title,
        content: document.content,
      },
    })

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Create document version error:', error)
    return NextResponse.json(
      { error: '保存版本失败' },
      { status: 500 }
    )
  }
}

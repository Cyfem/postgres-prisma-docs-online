import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// 获取特定版本的详细内容
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id, versionId } = await params

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

    // 获取版本详情
    const version = await prisma.documentVersion.findFirst({
      where: {
        id: versionId,
        documentId: id,
      },
    })

    if (!version) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 })
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error('Get version error:', error)
    return NextResponse.json(
      { error: '获取版本失败' },
      { status: 500 }
    )
  }
}

// 恢复到指定版本
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id, versionId } = await params

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

    // 获取要恢复的版本
    const version = await prisma.documentVersion.findFirst({
      where: {
        id: versionId,
        documentId: id,
      },
    })

    if (!version) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 })
    }

    // 先保存当前版本到历史
    await prisma.documentVersion.create({
      data: {
        documentId: id,
        title: document.title,
        content: document.content,
      },
    })

    // 恢复文档到指定版本
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title: version.title,
        content: version.content,
      },
    })

    return NextResponse.json({ document: updatedDocument })
  } catch (error) {
    console.error('Restore version error:', error)
    return NextResponse.json(
      { error: '恢复版本失败' },
      { status: 500 }
    )
  }
}

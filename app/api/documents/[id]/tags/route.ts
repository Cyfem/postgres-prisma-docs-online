import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// 获取文档的所有标签
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
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 })
    }

    const tags = document.tags.map((dt) => dt.tag)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Get document tags error:', error)
    return NextResponse.json(
      { error: '获取文档标签失败' },
      { status: 500 }
    )
  }
}

// 给文档添加标签
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
    const { tagId } = await request.json()

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

    // 检查标签是否属于当前用户
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: user.userId,
      },
    })

    if (!tag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 })
    }

    // 检查是否已经添加过
    const existing = await prisma.documentTag.findUnique({
      where: {
        documentId_tagId: {
          documentId: id,
          tagId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: '标签已添加' },
        { status: 400 }
      )
    }

    // 添加标签
    await prisma.documentTag.create({
      data: {
        documentId: id,
        tagId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Add document tag error:', error)
    return NextResponse.json(
      { error: '添加标签失败' },
      { status: 500 }
    )
  }
}

// 从文档移除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const tagId = searchParams.get('tagId')

    if (!tagId) {
      return NextResponse.json(
        { error: '缺少标签ID' },
        { status: 400 }
      )
    }

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

    // 移除标签
    await prisma.documentTag.deleteMany({
      where: {
        documentId: id,
        tagId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove document tag error:', error)
    return NextResponse.json(
      { error: '移除标签失败' },
      { status: 500 }
    )
  }
}

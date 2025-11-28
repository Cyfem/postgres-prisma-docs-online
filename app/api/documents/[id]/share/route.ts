import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { randomBytes } from 'crypto'

// 生成分享链接
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
    const existingDoc = await prisma.document.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!existingDoc) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 })
    }

    // 如果已经有 shareToken，直接返回
    if (existingDoc.shareToken && existingDoc.isPublic) {
      return NextResponse.json({
        shareToken: existingDoc.shareToken,
        shareUrl: `${request.nextUrl.origin}/share/${existingDoc.shareToken}`,
      })
    }

    // 生成新的 shareToken
    const shareToken = randomBytes(16).toString('hex')

    const document = await prisma.document.update({
      where: { id },
      data: {
        isPublic: true,
        shareToken,
      },
    })

    return NextResponse.json({
      shareToken: document.shareToken,
      shareUrl: `${request.nextUrl.origin}/share/${document.shareToken}`,
    })
  } catch (error) {
    console.error('Share document error:', error)
    return NextResponse.json(
      { error: '分享失败' },
      { status: 500 }
    )
  }
}

// 取消分享
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

    // 检查文档是否属于当前用户
    const existingDoc = await prisma.document.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!existingDoc) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 })
    }

    // 取消分享
    await prisma.document.update({
      where: { id },
      data: {
        isPublic: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unshare document error:', error)
    return NextResponse.json(
      { error: '取消分享失败' },
      { status: 500 }
    )
  }
}

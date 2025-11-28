import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 通过 shareToken 获取公开文档
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // 查找公开分享的文档
    const document = await prisma.document.findFirst({
      where: {
        shareToken: token,
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: '文档不存在或未公开分享' },
        { status: 404 }
      )
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Get shared document error:', error)
    return NextResponse.json(
      { error: '获取文档失败' },
      { status: 500 }
    )
  }
}

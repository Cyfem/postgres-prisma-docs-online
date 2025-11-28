import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { documentSchema } from '@/lib/validations'

// 获取所有文档
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const documents = await prisma.document.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        shareToken: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: '获取文档失败' },
      { status: 500 }
    )
  }
}

// 创建新文档
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = documentSchema.parse(body)

    const document = await prisma.document.create({
      data: {
        title: validatedData.title || '无标题文档',
        content: validatedData.content || '',
        userId: user.userId,
      },
    })

    return NextResponse.json({ document })
  } catch (error: any) {
    console.error('Create document error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '创建文档失败' },
      { status: 500 }
    )
  }
}

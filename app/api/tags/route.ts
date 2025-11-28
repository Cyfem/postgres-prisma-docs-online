import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { tagSchema } from '@/lib/validations'

// 获取所有标签
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    )
  }
}

// 创建标签
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = tagSchema.parse(body)

    // 检查标签是否已存在
    const existingTag = await prisma.tag.findFirst({
      where: {
        userId: user.userId,
        name: validatedData.name,
      },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: '标签名称已存在' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        color: validatedData.color || '#3b82f6',
        userId: user.userId,
      },
    })

    return NextResponse.json({ tag })
  } catch (error: any) {
    console.error('Create tag error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '创建标签失败' },
      { status: 500 }
    )
  }
}

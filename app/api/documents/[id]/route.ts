import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { documentSchema } from '@/lib/validations'

// 获取单个文档
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

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!document) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json(
      { error: '获取文档失败' },
      { status: 500 }
    )
  }
}

// 更新文档
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = documentSchema.parse(body)

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

    const document = await prisma.document.update({
      where: { id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
      },
    })

    return NextResponse.json({ document })
  } catch (error: any) {
    console.error('Update document error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '更新文档失败' },
      { status: 500 }
    )
  }
}

// 删除文档
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

    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { error: '删除文档失败' },
      { status: 500 }
    )
  }
}

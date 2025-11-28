import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { tagSchema } from '@/lib/validations'

// 更新标签
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
    const validatedData = tagSchema.parse(body)

    // 检查标签是否属于当前用户
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!existingTag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 })
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: validatedData.name,
        color: validatedData.color,
      },
    })

    return NextResponse.json({ tag })
  } catch (error: any) {
    console.error('Update tag error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '更新标签失败' },
      { status: 500 }
    )
  }
}

// 删除标签
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

    // 检查标签是否属于当前用户
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!existingTag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 })
    }

    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete tag error:', error)
    return NextResponse.json(
      { error: '删除标签失败' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { removeAuthCookie } from '@/lib/auth'

export async function POST() {
  try {
    await removeAuthCookie()

    return NextResponse.json({
      success: true,
      message: '已成功登出',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    )
  }
}

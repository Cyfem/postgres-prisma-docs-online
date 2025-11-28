import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // 公开路由
  const publicPaths = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path)

  // 分享页面也是公开的
  const isSharePath = request.nextUrl.pathname.startsWith('/share/') || request.nextUrl.pathname.startsWith('/api/share/')

  // 如果是公开路由或分享路由，直接放行
  if (isPublicPath || isSharePath) {
    // 如果已登录用户访问登录/注册页，重定向到应用页面
    if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
      return NextResponse.redirect(new URL('/app', request.url))
    }
    return NextResponse.next()
  }

  // 检查 token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 验证 token
  const payload = await verifyToken(token)
  if (!payload) {
    // Token 无效，清除 cookie 并重定向到登录页
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

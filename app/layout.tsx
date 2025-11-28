import './globals.css'
import { Inter } from 'next/font/google'
import AntdProvider from '@/components/AntdProvider'

export const metadata = {
  metadataBase: new URL('https://postgres-prisma.vercel.app'),
  title: '在线文档编辑器',
  description: '一个功能强大的在线文档协作平台',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.variable}>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  )
}

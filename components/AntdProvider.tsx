'use client'

import { ConfigProvider, App } from 'antd'
import zhCN from 'antd/locale/zh_CN'

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 8,
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}

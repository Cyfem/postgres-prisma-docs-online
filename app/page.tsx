export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold bg-gradient-to-br from-black via-[#171717] to-[#575757] bg-clip-text text-transparent">
          在线文档编辑器
        </h1>
        <p className="text-gray-600">
          一个功能强大的在线文档协作平台
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/login"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            登录
          </a>
          <a
            href="/register"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            注册
          </a>
        </div>
      </div>
    </main>
  )
}

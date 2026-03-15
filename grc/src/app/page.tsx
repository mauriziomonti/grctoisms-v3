export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Your GRC</h1>
        <p className="mt-2 text-gray-500">ISO 27001 &amp; ISO 42001 compliance workspace</p>
        <a
          href="/dashboard"
          className="mt-6 inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  )
}

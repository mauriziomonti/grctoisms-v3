export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">GDPR Scout</h1>
        <p className="mt-2 text-gray-500">GDPR compliance assessment and data mapping workspace</p>
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

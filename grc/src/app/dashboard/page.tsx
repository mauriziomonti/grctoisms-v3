export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">GRC Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-700">Controls</h2>
          <p className="text-sm text-gray-400 mt-1">ISO 27001 &amp; 42001 control tracking</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-700">Risk Register</h2>
          <p className="text-sm text-gray-400 mt-1">Identify, score and treat risks</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-700">Policies</h2>
          <p className="text-sm text-gray-400 mt-1">Version and manage your policy library</p>
        </div>
      </div>
    </main>
  )
}

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">GDPR Scout Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-700">Data Mapping</h2>
          <p className="text-sm text-gray-400 mt-1">Record of processing activities (ROPA)</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-700">Gap Assessment</h2>
          <p className="text-sm text-gray-400 mt-1">GDPR article compliance status</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-700">Breach Register</h2>
          <p className="text-sm text-gray-400 mt-1">Log and track data breaches</p>
        </div>
      </div>
    </main>
  )
}

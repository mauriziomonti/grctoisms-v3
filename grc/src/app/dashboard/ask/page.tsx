export default function AskPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant</h1>
      <p className="text-sm text-gray-400 mb-6">
        ISO-grounded AI guidance — requires ISO 27001 and ISO 42001 source documents to be indexed.
      </p>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-sm text-amber-700">
        <p className="font-medium mb-1">ISO documents not yet indexed</p>
        <p className="text-amber-600">
          Upload your ISO 27001 and ISO 42001 PDFs to activate the AI assistant. 
          The embedding pipeline will chunk and index them into the iso-documents Vectorize index.
        </p>
      </div>
    </div>
  )
}

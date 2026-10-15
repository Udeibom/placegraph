export default function ExplainPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Explain - Project {params.id}</h1>
        <p className="text-gray-600 mb-4">Provenance chain: Why decisions were made.</p>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Provenance viewer</p>
        </div>
      </div>
    </main>
  )
}

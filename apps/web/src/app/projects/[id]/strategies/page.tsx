export default function StrategiesPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Strategies - Project {params.id}</h1>
        <p className="text-gray-600 mb-4">Compare strategic directions with evidence and provenance.</p>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Strategy comparison UI - connect to API after project creation</p>
        </div>
      </div>
    </main>
  )
}

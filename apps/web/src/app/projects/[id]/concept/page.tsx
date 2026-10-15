export default function ConceptPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Concept - Project {params.id}</h1>
        <p className="text-gray-600 mb-4">Experience requirements, architectural decisions, spatial concept, visualizations.</p>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Concept/visualization UI</p>
        </div>
      </div>
    </main>
  )
}

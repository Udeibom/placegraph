export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Project {params.id}</h1>
        <p className="text-gray-600 mb-6">
          Cultural intelligence analysis pipeline
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`/projects/${params.id}/strategies`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Strategies</h2>
            <p className="text-gray-600 text-sm">Opportunities & strategic directions</p>
          </a>
          <a
            href={`/projects/${params.id}/concept`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Concept</h2>
            <p className="text-gray-600 text-sm">Experience reqs, architecture, visualization</p>
          </a>
          <a
            href={`/projects/${params.id}/explain`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">Provenance</h2>
            <p className="text-gray-600 text-sm">Explainable reasoning chain</p>
          </a>
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">PlaceGraph</h1>
        <p className="text-lg text-gray-600 mb-8">
          Cultural intelligence + architectural design for commercial spaces
        </p>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <p className="text-gray-700 mb-4">
            Start a new project to analyze location, audience, and cultural context.
          </p>
          <a
            href="/projects/new"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            New Project
          </a>
        </div>
      </div>
    </main>
  )
}

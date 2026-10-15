'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProject() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    location: { address: '', city: '' },
    projectType: 'restaurant',
    objective: '',
    budgetRange: '',
    floorArea: '',
    audiences: [{ name: '', description: '' }]
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/projects/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">New Project</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Downtown Bistro"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Address or neighborhood"
              value={form.location.address}
              onChange={(e) => setForm({
                ...form,
                location: { ...form.location, address: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.projectType}
              onChange={(e) => setForm({ ...form, projectType: e.target.value as any })}
            >
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="retail">Retail</option>
              <option value="hospitality">Hospitality</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Business Objective</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="What should this place become, for whom, and why?"
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget Range</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., $500k-1M"
                value={form.budgetRange}
                onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Floor Area</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., 2000 sq ft"
                value={form.floorArea}
                onChange={(e) => setForm({ ...form, floorArea: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </main>
  )
}

'use client';

import { useState } from 'react';

export default function NewProject() {
  const [form, setForm] = useState({
    name: '',
    location: { address: '', city: '' },
    projectType: 'restaurant',
    objective: '',
    audiences: [{ name: '', description: '' }]
  });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">New Project</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Downtown Bistro"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create Project
          </button>
        </form>
      </div>
    </main>
  )
}

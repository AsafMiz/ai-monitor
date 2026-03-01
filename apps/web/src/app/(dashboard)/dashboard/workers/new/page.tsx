'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewWorkerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // TODO: Call API to create agent
    console.log('Creating worker:', Object.fromEntries(formData));

    setLoading(false);
    router.push('/dashboard/workers');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create New Worker</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Worker Name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g., Support Agent Sarah"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role / Job Title
          </label>
          <input
            id="role"
            name="role"
            required
            placeholder="e.g., Customer Support Specialist"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="backstory" className="block text-sm font-medium text-gray-700 mb-1">
            Background & Expertise
          </label>
          <textarea
            id="backstory"
            name="backstory"
            rows={3}
            placeholder="Describe this worker's background, expertise, and communication style..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Goal
          </label>
          <textarea
            id="goal"
            name="goal"
            rows={2}
            placeholder="What should this worker try to achieve? e.g., Resolve customer issues quickly and empathetically"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Worker'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

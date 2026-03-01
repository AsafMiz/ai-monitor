import Link from 'next/link';

export default function WorkersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workers</h1>
        <Link
          href="/dashboard/workers/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + New Worker
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-500 mb-4">No workers yet. Create your first AI worker to get started.</p>
        <Link
          href="/dashboard/workers/new"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          Create a worker &rarr;
        </Link>
      </div>
    </div>
  );
}

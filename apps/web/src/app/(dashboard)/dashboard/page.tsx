import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Active Workers</h3>
          <p className="mt-2 text-3xl font-bold">0 / 5</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Conversations Today</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Messages This Month</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}

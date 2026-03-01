import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4">
        <h1 className="text-lg font-bold mb-6">AI Monitor</h1>
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/workers"
            className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            Workers
          </Link>
          <Link
            href="/dashboard/activity"
            className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            Activity
          </Link>
          <Link
            href="/dashboard/settings"
            className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

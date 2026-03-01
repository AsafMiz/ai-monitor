'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleManageBilling = async () => {
    // TODO: Call /api/stripe/portal with workspace_id
    console.log('Opening billing portal...');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Subscription */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Subscription</h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage your subscription and billing details.
          </p>
          <button
            onClick={handleManageBilling}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
          >
            Manage Billing
          </button>
        </div>

        {/* Account */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Account</h2>
          <p className="text-sm text-gray-600 mb-4">
            Sign out of your account.
          </p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

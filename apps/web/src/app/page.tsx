import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 px-6 py-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">AI Monitor</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            AI Workers for Your Business
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Create, customize, and deploy AI workers that handle customer support,
            sales, and operations across WhatsApp, Slack, and email.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Start Free Trial
            </Link>
            <Link
              href="#features"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Learn more &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">📚</div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Page Not Found
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        The documentation page you're looking for doesn't exist yet. It might be coming soon!
      </p>
      <div className="flex gap-4">
        <Link
          href="/docs"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Back to Docs Home
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}


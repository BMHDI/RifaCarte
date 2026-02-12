export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 animate-pulse">

      {/* HEADER SKELETON */}
      <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 mb-6" />

      <div className="flex flex-1 max-w-6xl mx-auto px-4 gap-6">

        {/* SIDEBAR SKELETON */}
        <aside className="hidden lg:block w-44 space-y-4">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </aside>

        {/* MAIN CONTENT SKELETON */}
        <main className="flex-1 space-y-6">
          <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-4 rounded bg-gray-200 dark:bg-gray-700 ${i === 0 ? 'w-full' : i === 1 ? 'w-5/6' : i === 2 ? 'w-4/6' : 'w-3/6'}`} />
            ))}
          </div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg border" />
        </main>

      </div>
    </div>
  );
}

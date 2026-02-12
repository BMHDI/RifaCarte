export default function Loading() {
  return (
    <div className="bg-white dark:bg-gray-900 animate-pulse">

      {/* BACK BUTTON */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">

        {/* LEFT */}
        <section>

          {/* IMAGE */}
          <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />

          {/* TITLE */}
          <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

          {/* PARAGRAPHS */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-11/12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-10/12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-9/12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* LIST */}
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </section>

        {/* RIGHT */}
        <aside className="space-y-6">

          {/* MAP */}
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg border" />

          {/* CONTACT CARD */}
          <div className="border rounded-lg p-5 space-y-4">

            {/* TITLE */}
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />

            {/* ROWS */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}

            {/* BUTTONS */}
            <div className="pt-2 flex gap-2">
              <div className="h-9 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-9 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}

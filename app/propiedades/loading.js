export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-soft pb-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-gray-200" />
        <div className="mb-10 h-40 animate-pulse rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="aspect-[4/3] animate-pulse bg-gray-200" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-2/5 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

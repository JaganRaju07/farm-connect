export default function Home() {
  return (
    <main className="container-app py-10">
      <h1 className="text-4xl font-bold mb-4">Farm Connect</h1>
      <p className="mb-6 text-gray-600">
        Welcome to Farm Connect platform.
      </p>

      <div className="card p-6">
        <h2 className="text-2xl font-semibold mb-2">Marketplace</h2>
        <p>Buy and sell fresh farm products directly.</p>

        <button className="btn-primary mt-4">
          Explore Now
        </button>
      </div>
    </main>
  );
}
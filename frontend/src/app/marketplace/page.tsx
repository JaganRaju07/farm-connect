import ProtectedRoute from '@/components/common/ProtectedRoute';

function ProductCard() {
  return (
    <div className="border p-4 rounded-lg shadow-md mt-4 w-60">
      <h2 className="text-xl font-bold">🥬 Tomato</h2>
      <p>₹40 / kg</p>
      <p>Farmer: Ramesh</p>
      <p>City: Mysore</p>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <ProtectedRoute allowedRoles={['consumer']}>
      <ProductCard />
    </ProtectedRoute>
  );
}
'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function RestaurantsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data } = await api.get('/restaurants');
      return data;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Restaurants</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : !data?.restaurants?.length ? (
        <p className="text-gray-400 text-center py-20">No restaurants available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.restaurants.map((r: any) => (
            <div key={r._id} className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg">{r.name}</h2>
              <p className="text-gray-500">{r.cuisine}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

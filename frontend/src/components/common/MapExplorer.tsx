'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Loader2, Leaf, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getRelativeHarvestDate } from '@/lib/utils';

// Dynamically import the map components with SSR disabled to prevent 'window is not defined' errors
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });

import { Product } from '@/types';

// Helper to fix missing marker icons in leaflet with Next.js
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }
};

interface MapExplorerProps {
  products: (Product & { 
    farmerLat?: number; 
    farmerLon?: number; 
    distance_km?: number;
  })[];
  consumerLocation?: { lat: number; lon: number } | null;
}

export default function MapExplorer({ products, consumerLocation }: MapExplorerProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  if (typeof window === 'undefined') {
    return (
      <div className="h-[500px] w-full rounded-2xl bg-earth-100 flex items-center justify-center border border-earth-200">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Extract unique farmers from the products list
  const farmersMap = new Map();
  products.forEach(p => {
    if (p.farmerLat && p.farmerLon) {
      if (!farmersMap.has(p.farmerId)) {
        farmersMap.set(p.farmerId, {
          id: p.farmerId,
          name: p.farmerName,
          city: p.farmerCity,
          lat: p.farmerLat,
          lon: p.farmerLon,
          distance: p.distance_km,
          products: []
        });
      }
      // Add product to this farmer
      farmersMap.get(p.farmerId).products.push(p);
    }
  });

  const uniqueFarmers = Array.from(farmersMap.values());
  const center: [number, number] = consumerLocation ? [consumerLocation.lat, consumerLocation.lon] : [12.9716, 77.5946];

  let bounds = undefined;
  if (typeof window !== 'undefined' && uniqueFarmers.length > 0) {
    const L = require('leaflet');
    bounds = L.latLngBounds(uniqueFarmers.map(f => [f.lat, f.lon]));
    if (consumerLocation) {
      bounds.extend([consumerLocation.lat, consumerLocation.lon]);
    }
  }

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-earth-200 shadow-sm relative z-0">
      <MapContainer 
        center={bounds ? undefined : center} 
        zoom={bounds ? undefined : 11} 
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Consumer Location Circle */}
        {consumerLocation && (
          <Circle 
            center={center} 
            pathOptions={{ fillColor: 'blue', color: 'blue', fillOpacity: 0.1, weight: 1 }} 
            radius={15000} // 15km default radius
          />
        )}
        
        {/* Consumer Marker */}
        <Marker position={center}>
          <Popup>
            <div className="font-bold text-earth-900">Your Location</div>
            <div className="text-sm text-earth-500">Searching for farms nearby.</div>
          </Popup>
        </Marker>

        {/* Farmer Markers */}
        {uniqueFarmers.map((farmer) => (
          <Marker key={farmer.id} position={[farmer.lat, farmer.lon]}>
            <Popup className="custom-popup">
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg text-earth-900 mb-1">{farmer.name}</h3>
                <p className="text-sm text-earth-600 mb-3 flex items-center gap-1">
                  📍 {farmer.city} • <span className="font-semibold text-primary-600">{farmer.distance} km away</span>
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs font-bold text-earth-500 uppercase tracking-wider">Available Produce</p>
                  <ul className="text-sm space-y-2">
                    {farmer.products.slice(0, 3).map((p: any) => (
                      <li key={p.id} className="bg-earth-50 px-3 py-2 rounded flex flex-col gap-1 border border-earth-100">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-earth-900 truncate pr-2">{p.name} {p.isOrganic && '🌱'}</span>
                          <span className="font-bold text-primary-700 whitespace-nowrap">₹{p.price}/{p.unit}</span>
                        </div>
                        {p.harvestDate && getRelativeHarvestDate(p.harvestDate) && (
                          <div className="flex items-center text-[10px] font-medium text-success-700 bg-success-100/50 w-fit px-1.5 py-0.5 rounded">
                            <Leaf className="w-2.5 h-2.5 mr-1" />
                            {getRelativeHarvestDate(p.harvestDate)}
                          </div>
                        )}
                        <Link href={`/product/${p.id}`} className="text-xs text-primary-600 hover:underline flex items-center mt-1">
                          View Details <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </li>
                    ))}
                    {farmer.products.length > 3 && (
                      <li className="text-xs text-earth-500 italic text-center mt-2">
                        + {farmer.products.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

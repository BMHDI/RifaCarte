'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '../ui/spinner';
import MapSkeleton from './mapSkelton';

const MapView = dynamic(() => import('./MapView').then(m => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
     <MapSkeleton/>
    </div>
  ),
});

export default function LazyMap() {
  return <MapView />;
}

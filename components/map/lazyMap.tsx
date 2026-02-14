'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '../ui/spinner';

const MapView = dynamic(() => import('./MapView').then(m => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="h-12 w-12" />
    </div>
  ),
});

export default function LazyMap() {
  return <MapView />;
}

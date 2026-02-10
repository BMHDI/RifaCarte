// lib/regionUtils.ts
import * as turf from '@turf/turf';
import regions from '@/lib/francophone-regions.json'; // your geojson

export function getRegionFromCoords(lat: number, lng: number): string | null {
  const point = turf.point([lng, lat]);

  for (const feature of regions.features) {
    const polygon = turf.polygon(feature.geometry.coordinates);

    if (turf.booleanPointInPolygon(point, polygon)) {
      return feature.properties.name; // Centre | Sud | Nord
    }
  }

  return null;
}

import { useState, useEffect } from 'react';
import { fetchFilteredOrgs } from '@/lib/db';
import { getCategoryIdsFromGroups } from '@/lib/utils';
import { Org } from '@/types/types';

interface UseFilteredOrgsParams {
  query: string;
  selectedCategories: string[];
  selectedCities: string[];
  activeRegion: string | null;
}

export function useFilteredOrgs({
  query,
  selectedCategories,
  selectedCities,
  activeRegion,
}: UseFilteredOrgsParams) {
  const [dbOrgs, setDbOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrgs = async () => {
      if (!activeRegion) return;

      try {
        setLoading(true);

        const data = await fetchFilteredOrgs({
          query,
          categories: getCategoryIdsFromGroups(selectedCategories),
          cities: selectedCities,
          region: activeRegion,
        });

        const normalized = data.map((org) => ({
          ...org,
          locations:
            org.lat && org.lng
              ? [
                  {
                    lat: org.lat,
                    lng: org.lng,
                    city: org.city ?? '',
                    address: org.address ?? '',
                  },
                ]
              : [],
        }));

        setDbOrgs(normalized);
      } catch (err) {
        console.error('❌ Failed to fetch orgs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [query, selectedCategories, selectedCities, activeRegion]);

  return { dbOrgs, loading };
}

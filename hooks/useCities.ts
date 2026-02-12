'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchCities } from '@/lib/db';
import { Org } from '@/types/types';

interface UseCitiesProps {
  activeRegion?: string | null;
  dbOrgs: Org[];
}

export function useCities({ activeRegion, dbOrgs }: UseCitiesProps) {
  const [allCities, setAllCities] = useState<string[]>([]);

  // Fetch all cities once
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesFromDB = await fetchCities();
        setAllCities(citiesFromDB.sort());
      } catch (err) {
        console.error('Failed to load cities', err);
      }
    };

    loadCities();
  }, []);

  // Derived cities based on activeRegion and dbOrgs
  const filteredCitiesForRegion = useMemo(() => {
    if (!activeRegion) return allCities;

    const citySet = new Set<string>();
    dbOrgs.forEach((org) =>
      org.locations.forEach((loc) => {
        if (loc.city) citySet.add(loc.city);
      })
    );

    return Array.from(citySet).sort();
  }, [activeRegion, dbOrgs, allCities]);

  return filteredCitiesForRegion;
}

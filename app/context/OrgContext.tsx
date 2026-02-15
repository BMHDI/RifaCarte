'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SelectedOrg, OrgContextType, Org } from '@/types/types';
import { fetchFilteredOrgs } from '@/lib/db'; // your Supabase functions

const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  // Map instance
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  // --- NEW: all organizations lazy-loaded ---
  const [allOrgs, setAllOrgs] = useState<Org[] | null>(null); // null = not loaded yet
  const [loadingOrgs, setLoadingOrgs] = useState(false);       // loading state

  // --- Filters & user selections ---
  const [savedOrgs, setSavedOrgs] = useState<Org[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'ai' | 'Favorites'>('search');

  // --- Map view defaults ---
  const getDefaultView = () => {
    if (typeof window === 'undefined') return { longitude: -114.0719, latitude: 53.0447, zoom: 3 };
    const w = window.innerWidth;
    if (w >= 1024) return { longitude: -114.0719, latitude: 54.0447, zoom: 5 }; // desktop
    return { longitude: -114.0719, latitude: 53.0447, zoom: 4 }; // mobile/tablet
  };

  const DEFAULT_VIEW = { longitude: -114.0719, latitude: 53.0447, zoom: 4 };
  const [viewState, setViewState] = useState(() => getDefaultView());
  const resetMapView = () => setViewState(DEFAULT_VIEW);

  // --- Hydrate from localStorage AFTER mount ---
  useEffect(() => {
    try {
      const rawSaved = localStorage.getItem('savedOrgs');
      if (rawSaved) setSavedOrgs(JSON.parse(rawSaved));

      const q = localStorage.getItem('query');
      if (q) setQuery(q);

      const cats = localStorage.getItem('selectedCategories');
      if (cats) setSelectedCategories(JSON.parse(cats));

      const cities = localStorage.getItem('selectedCities');
      if (cities) setSelectedCities(JSON.parse(cities));

      const region = localStorage.getItem('activeRegion');
      if (region) setActiveRegion(region);
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }, []);

  // --- Sync OUT to localStorage ---
  useEffect(() => { localStorage.setItem('savedOrgs', JSON.stringify(savedOrgs)); }, [savedOrgs]);
  useEffect(() => { localStorage.setItem('query', query); }, [query]);
  useEffect(() => { localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories)); }, [selectedCategories]);
  useEffect(() => { localStorage.setItem('selectedCities', JSON.stringify(selectedCities)); }, [selectedCities]);
  useEffect(() => { if (activeRegion !== null) localStorage.setItem('activeRegion', activeRegion); }, [activeRegion]);

  // --- Actions ---
  const toggleSavedOrg = (org: Org) => {
    setSavedOrgs(prev =>
      prev.some(o => o.id === org.id)
        ? prev.filter(o => o.id !== org.id)
        : [...prev, org]
    );
  };

  const savedOrgIds = useMemo(() => new Set(savedOrgs.map(o => o.id)), [savedOrgs]);
  const isSaved = (orgId: string) => savedOrgIds.has(orgId);

  const resetAllFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedCities([]);
    setSelectedOrg(null);
    setActiveRegion?.(null);
    resetMapView();
    localStorage.removeItem('activeRegion');
  };

  // --- Lazy load all organizations (Supabase) AFTER first paint ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoadingOrgs(true);
      try {
        const data = await fetchFilteredOrgs({}); // fetch all orgs
        setAllOrgs(data);
      } catch (e) {
        console.error('Failed to load organizations', e);
      } finally {
        setLoadingOrgs(false);
      }
    }, 50); // small delay to allow initial render

    return () => clearTimeout(timer);
  }, []);

  // --- Context value ---
  return (
    <OrgContext.Provider
      value={{
        mapInstance,
        setMapInstance,
        viewState,
        setViewState,
        resetMapView,

        savedOrgs,
        toggleSavedOrg,
        isSaved,

        query,
        setQuery,
        selectedCategories,
        setSelectedCategories,
        selectedCities,
        setSelectedCities,
        selectedOrg,
        setSelectedOrg,
        activeRegion,
        setActiveRegion,
        activeTab,
        setActiveTab,
        resetAllFilters,

        // NEW
        allOrgs,
        loadingOrgs,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

// --- Hook to consume the context ---
export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used inside OrgProvider');
  return ctx;
};

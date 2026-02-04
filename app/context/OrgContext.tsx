"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { SelectedOrg, OrgContextType, Org } from "@/types/types";


const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  // ✅ neutral defaults for SSR
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  const [savedOrgs, setSavedOrgs] = useState<Org[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);


  const getDefaultView = () => {
  if (typeof window === "undefined") {
    return {
      longitude: -114.0719,
      latitude: 53.0447,
      zoom: 3,
    };
  }

  const w = window.innerWidth;

  if (w >= 1024) {
    // laptop / desktop
    return {
      longitude: -114.0719,
      latitude: 54.0447,
      zoom: 5,
    };
  }

  // mobile / tablet
  return {
    longitude: -114.0719,
    latitude: 53.0447,
    zoom: 4,
  };
};

    const DEFAULT_VIEW = {
  longitude: -114.0719, // Calgary-ish center of Alberta
  latitude: 53.0447,
  zoom: 4,
};
const [viewState, setViewState] = useState(() => getDefaultView());

const resetMapView = () => setViewState(DEFAULT_VIEW);

  // ✅ hydrate from localStorage AFTER mount (client only)
  useEffect(() => {
    try {
      const rawSaved = localStorage.getItem("savedOrgs");
      if (rawSaved) setSavedOrgs(JSON.parse(rawSaved));

      const q = localStorage.getItem("query");
      if (q) setQuery(q);

      const cats = localStorage.getItem("selectedCategories");
      if (cats) setSelectedCategories(JSON.parse(cats));

      const cities = localStorage.getItem("selectedCities");
      if (cities) setSelectedCities(JSON.parse(cities));
    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }
  }, []);

  // ✅ sync OUT to localStorage
  useEffect(() => {
    localStorage.setItem("savedOrgs", JSON.stringify(savedOrgs));
  }, [savedOrgs]);

  useEffect(() => {
    localStorage.setItem("query", query);
  }, [query]);

  useEffect(() => {
    localStorage.setItem(
      "selectedCategories",
      JSON.stringify(selectedCategories),
    );
  }, [selectedCategories]);

  useEffect(() => {
    localStorage.setItem("selectedCities", JSON.stringify(selectedCities));
  }, [selectedCities]);
// 
  // actions
  const toggleSavedOrg = (org: Org) => {
    setSavedOrgs((prev) =>
      prev.some((o) => o.id === org.id)
        ? prev.filter((o) => o.id !== org.id)
        : [...prev, org],
    );
  };

  const savedOrgIds = useMemo(
    () => new Set(savedOrgs.map((o) => o.id)),
    [savedOrgs],
  );
  //helper local activew region
  const isSaved = (orgId: string) => savedOrgIds.has(orgId);
  useEffect(() => {
  try {
    const storedRegion = localStorage.getItem("activeRegion");
    if (storedRegion) setActiveRegion(storedRegion);
  } catch (e) {
    console.error("Failed to load activeRegion from localStorage", e);
  }
}, []);
useEffect(() => {
  if (activeRegion !== null) {
    localStorage.setItem("activeRegion", activeRegion);
  }
}, [activeRegion]);


const resetAllFilters = () => {
  setQuery("");
  setSelectedCategories([]);
  setSelectedCities([]);
  setSelectedOrg(null);
  setActiveRegion?.(null);
  resetMapView(); 
  localStorage.removeItem("activeRegion");// ✅ zoom + center reset
};


  // const clearSavedOrgs = () => setSavedOrgs([]);

  return (
    <OrgContext.Provider
      value={{
        selectedOrg,
        setSelectedOrg,
        query,
        setQuery,
        selectedCategories,
        setSelectedCategories,
        selectedCities,
        setSelectedCities,
        savedOrgs,
        toggleSavedOrg,
        isSaved,
        activeRegion,
        setActiveRegion,
        resetAllFilters,
        // clearSavedOrgs,
        resetMapView,
        viewState,
        setViewState,   
        mapInstance,
      setMapInstance, 
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside OrgProvider");
  return ctx;
};
/**

 * Hook to access the OrgContext.

 * It will throw an error if it's not used inside OrgProvider.

 * @returns {OrgContextType} The OrgContext value

 */

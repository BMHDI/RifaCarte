"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchFilteredOrgs, fetchCities } from "@/lib/db";
import { useOrg } from "@/app/context/OrgContext";
import { OrgCard } from "../ui/OrgCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "../ui/sidebar";
import SearchWithFilters from "./SearchWithFilters";
import { Badge } from "../ui/badge";
import { ArrowBigDown } from "lucide-react";
import CATEGORIES from "@/lib/categories";
import { Org } from "@/types/types";
import { RegionSelectorList } from "../ui/RegionSelectorList";
import { getCategoryIdsFromGroups } from "@/lib/utils";
import { useRef } from "react";
import { Map as MapboxMap } from "react-map-gl/mapbox";
import { Spinner } from "@/components/ui/spinner"


export function OrgSearch() {
  const {
    query,
    setQuery,
    selectedCategories,
    setSelectedCategories,
    selectedCities,
    setSelectedCities,
    setSelectedOrg,
    toggleSavedOrg,
    isSaved,
    activeRegion,
    resetAllFilters,
    mapInstance
  } = useOrg();

  const [dbOrgs, setDbOrgs] = useState<Org[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const mapRef = useRef<typeof MapboxMap | null>(null);
  // -----------------------------------
  // Categories list
  // -----------------------------------
  const groupNames = useMemo(() => CATEGORIES.map((g) => g.group), []);

  // -----------------------------------
  // Fetch all cities once
  // -----------------------------------
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesFromDB = await fetchCities();
        setAllCities(citiesFromDB.sort());
      } catch (err) {
        console.error("Failed to load cities", err);
      }
    };
    loadCities();
  }, []);

  // -----------------------------------
  // Fetch organizations whenever filters change
  // -----------------------------------
  useEffect(() => {
    const fetchOrgs = async () => {
      const categoryIds = getCategoryIdsFromGroups(selectedCategories);

      if (!activeRegion) {
        console.log("❌ No activeRegion, aborting");
        return;
      }

      try {
        setLoading(true);

        const data = await fetchFilteredOrgs({
          query,
          categories: categoryIds,
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
                    city: org.city ?? "",
                    address: org.address ?? "",
                  },
                ]
              : [],
        }));

        setDbOrgs(normalized);
      } catch (err) {
        console.error("❌ Failed to fetch orgs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [query, selectedCategories, selectedCities, activeRegion]);

  // -----------------------------------
  // Derived cities for dropdown
  // -----------------------------------
  const filteredCitiesForRegion = useMemo(() => {
    if (!activeRegion) return allCities;

    const citySet = new Set<string>();
    dbOrgs.forEach((org) =>
      org.locations.forEach((loc) => {
        if (loc.city) citySet.add(loc.city);
      }),
    );

    return Array.from(citySet).sort();
  }, [activeRegion, dbOrgs, allCities]);

  // -----------------------------------
  // Filter toggles
  // -----------------------------------
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  };

  // -----------------------------------
  // Render
  // -----------------------------------
  return (
    <div className="flex w-full flex-col h-[80vh]">
      <div className="h-full grid gap-2 mb-2 overflow-y-auto [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {!activeRegion && <RegionSelectorList />}
        {loading && <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-18 w-18" />}
        {!loading && activeRegion && dbOrgs.length === 0 && (
          <p>Aucun organisme trouvé.</p>
        )}

        {activeRegion &&
          dbOrgs.map((org) => (
            <OrgCard
              key={org.id}
              image_url={org.image_url ?? ""}
              name={org.name}
              phone={org.contact?.phone ?? ""}
              address={org.locations[0]?.address ?? ""}
              category={org.category}
              onDetails={() => {}}
              onShare={() => {}}
              onSave={() => toggleSavedOrg(org)}
              isSaved={isSaved(org.id)}
              onMap={() => {
                if (org.locations.length === 1) {
                  setSelectedOrg({
                    org,
                    location: org.locations[0],
                  });

                  // Fly to single location
               if (mapInstance) {
  // single location
  mapInstance.flyTo({
    center: [org.locations[0].lng, org.locations[0].lat],
    zoom: 14,
    essential: true,
  });

                  }
                } else {
                  // Multiple locations → select all markers
               // or multiple locations
               if (mapInstance) {
  const lats = org.locations.map(l => l.lat ?? 0);
  const lngs = org.locations.map(l => l.lng ?? 0);

  mapInstance.fitBounds(
    [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    { padding: 80 }
  );}
}

                if (isMobile) toggleSidebar();
              }}
            />
          ))}
      </div>

      {/* Filters summary */}
      <div className="mx-4 flex flex-col">
        {selectedCategories.length > 0 || selectedCities.length > 0  || activeRegion? (
          <>
            <div className="flex justify-center">
              <button
                onClick={resetAllFilters}
                className="text-sm font-semibold hover:underline hover:text-red-600"
              >
                ↺ Réinitialiser tous les filtres
              </button>
            </div>

            {selectedCategories.length > 0 && (
              <>
                <span className="text-sm">Catégories :</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.map((c) => (
                    <Badge key={c} onClick={() => toggleCategory(c)}>
                      {c} ✕
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {selectedCities.length > 0 && (
              <>
                <span className="text-sm">Villes :</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCities.map((c) => (
                    <Badge key={c} onClick={() => toggleCity(c)}>
                      {c} ✕
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center gap-1">
            <p className="text-xs font-medium">
              Utilisez le bouton filtres pour choisir la ville ou la catégorie
            </p>
            <ArrowBigDown className="h-5" />
          </div>
        )}
      </div>

      {/* Filters dropdown */}
      <div className="z-50">
        <SearchWithFilters
          query={query}
          setQuery={setQuery}
          categories={groupNames}
          cities={filteredCitiesForRegion} // ✅ only cities in region
          selectedCategories={selectedCategories}
          selectedCities={selectedCities}
          toggleCategory={toggleCategory}
          toggleCity={toggleCity}
        />
      </div>
    </div>
  );
}

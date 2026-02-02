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
  } = useOrg();

  const [dbOrgs, setDbOrgs] = useState<Org[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  // -----------------------------------
  // Categories list
  // -----------------------------------
  const groupNames = useMemo(() => CATEGORIES.map((g) => g.group), []);

  // -----------------------------------
  // Fetch cities once from DB
  // -----------------------------------
  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await fetchCities();
        setCities(data);
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
      if (!activeRegion) return;

      try {
        setLoading(true);

        const data = await fetchFilteredOrgs({
          query,
          categories: selectedCategories,
          cities: selectedCities,
          region: activeRegion,
        });

        const normalized: Org[] = data.map((org) => ({
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
        console.error("Failed to fetch orgs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgs();
  }, [query, selectedCategories, selectedCities, activeRegion]);

  // -----------------------------------
  // Filter toggles
  // -----------------------------------
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  // -----------------------------------
  // Render
  // -----------------------------------
  return (
    <div className="flex w-full flex-col h-[80vh]">
      <div className="h-full grid gap-2 mb-2 overflow-y-auto [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {!activeRegion && <RegionSelectorList />}

        {loading && <p>Chargement des organismes…</p>}
        {!loading && activeRegion && dbOrgs.length === 0 && (
          <p>Aucun organisme trouvé.</p>
        )}

        {activeRegion &&
          dbOrgs.map((org) => (
            <OrgCard
              key={org.id}
              logo=""
              name={org.name}
              phone={org.contact?.phone ?? ""}
              address={org.locations[0]?.address ?? ""}
              category={org.category}
              onDetails={() => {}}
              onShare={() => {}}
              onMap={() => {
                setSelectedOrg({
                  org,
                  locations: org.locations,
                });
                if (isMobile) toggleSidebar();
              }}
              onSave={() => toggleSavedOrg(org)}
              isSaved={isSaved(org.id)}
            />
          ))}
      </div>

      {/* Filters summary */}
      <div className="mx-4 flex flex-col">
        {selectedCategories.length > 0 || selectedCities.length > 0 ? (
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
          cities={cities}
          selectedCategories={selectedCategories}
          selectedCities={selectedCities}
          toggleCategory={toggleCategory}
          toggleCity={toggleCity}
        />
      </div>
    </div>
  );
}

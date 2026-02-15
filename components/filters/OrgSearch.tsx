'use client';

import { useMemo } from 'react';
import { useOrg } from '@/app/context/OrgContext';
import { OrgCard } from '../ui/OrgCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '../ui/sidebar';
import SearchWithFilters from './SearchWithFilters';
import { Badge } from '../ui/badge';
import { ArrowBigDown, RotateCcw } from 'lucide-react';
import CATEGORIES from '@/lib/categories';
import { RegionSelectorList } from '../ui/RegionSelectorList';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '../ui/button';
import { useFilteredOrgs } from '@/hooks/useFilteredOrgs';
import { useCities } from '@/hooks/useCities';

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
    mapInstance,
  } = useOrg();

  const { dbOrgs, loading } = useFilteredOrgs({
    query,
    selectedCategories,
    selectedCities,
    activeRegion,
  });

  // Safe filtered cities for region
  const filteredCitiesForRegion = useMemo(() => {
    if (!dbOrgs || !activeRegion) return [];

    const cities = dbOrgs
      .filter((o) => o.region === activeRegion)
      .flatMap((o) => o.locations?.map((l) => l.city) ?? []) // safe optional chaining
      .filter(Boolean);

    return Array.from(new Set(cities)).sort();
  }, [dbOrgs, activeRegion]);

  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  // Categories list
  const groupNames = useMemo(() => CATEGORIES.map((g) => g.group), []);

  // Filter toggles
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
    <div className="flex w-full flex-col h-[87dvh]">
      {/* Filters dropdown */}
      {activeRegion && (
        <div>
          <SearchWithFilters
            query={query}
            setQuery={setQuery}
            categories={groupNames}
            cities={filteredCitiesForRegion as string[]}
            selectedCategories={selectedCategories}
            selectedCities={selectedCities}
            toggleCategory={toggleCategory}
            toggleCity={toggleCity}
          />
        </div>
      )}

      {/* Filters summary */}
      <div className="flex flex-col top-0 z-10">
        {selectedCategories.length > 0 || selectedCities.length > 0 || activeRegion ? (
          <>
            <div className="flex justify-center py-2">
              <Button
                onClick={resetAllFilters}
                className="text-sm font-medium cursor-pointer flex items-center gap-0 h-6 shadow-md hover:scale-101"
              >
                <RotateCcw /> <p className="px-1">Réinitialiser</p>
              </Button>
            </div>

            {selectedCategories.length > 0 && (
              <>
                <span className="text-xs font-medium">Catégories :</span>
                <div className="flex flex-wrap gap-1 p-2">
                  {selectedCategories.map((c) => (
                    <Badge
                      className="cursor-pointer shadow-md"
                      key={c}
                      onClick={() => toggleCategory(c)}
                    >
                      {c} ✕
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {selectedCities.length > 0 && (
              <>
                <span className="text-xs font-medium">Villes :</span>
                <div className="flex flex-wrap gap-1 p-2">
                  {selectedCities.map((c) => (
                    <Badge
                      className="cursor-pointer shadow-md"
                      key={c}
                      onClick={() => toggleCity(c)}
                    >
                      {c} ✕
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center gap-4">
            <div className="bg-gray-100 rounded-md flex p-4 flex-col items-center">
              <p className="text-sm font-medium text-center text-gray-700">
                Commencez par choisir une région, puis utilisez les filtres.
              </p>
              <ArrowBigDown className="animate-bounce" size={28} />
            </div>
          </div>
        )}
      </div>

      <div
        className="h-full overflow-y-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          rowGap: '1rem',
          columnGap: '0px',
          gridAutoRows: '1fr',
        }}
      >
        {!activeRegion && <RegionSelectorList />}

        {loading && (
          <Spinner className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-18 w-18" />
        )}

        {!loading && activeRegion && dbOrgs.length === 0 && <p>Aucun organisme trouvé.</p>}

        {activeRegion &&
          dbOrgs.map((org) => (
            <OrgCard
              id={org.id ?? ''}
              key={org.id}
              image_url={org.image_url ?? ''}
              name={org.name}
              phone={org.phone ?? ''}
              address={org.locations?.[0]?.address ?? ''}
              category={org.category}
              onSave={() => toggleSavedOrg(org)}
              isSaved={isSaved(org.id ?? '')}
              onMap={() => {
                if (org.locations?.length === 1) {
                  setSelectedOrg({
                    org,
                    location: org.locations[0],
                  });

                  if (mapInstance) {
                    mapInstance.flyTo({
                      center: [org.locations[0].lng, org.locations[0].lat],
                      zoom: 14,
                      essential: true,
                    });
                  }
                } else if (org.locations?.length) {
                  if (mapInstance) {
                    const lats = org.locations.map((l) => l.lat ?? 0);
                    const lngs = org.locations.map((l) => l.lng ?? 0);
                    mapInstance.fitBounds(
                      [
                        [Math.min(...lngs), Math.min(...lats)],
                        [Math.max(...lngs), Math.max(...lats)],
                      ],
                      { padding: 80 }
                    );
                  }
                }

                if (isMobile) toggleSidebar();
              }}
            />
          ))}
      </div>
    </div>
  );
}

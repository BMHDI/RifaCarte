import { useMemo } from "react";
import organizations from "../lib/org.json";
import { useOrg } from "@/app/context/OrgContext";

export function useCities() {
  const { activeRegion } = useOrg();

  const cities = useMemo(() => {
    const set = new Set<string>();

    organizations.forEach((o) => {
      const orgRegion = o.region?.trim().toLowerCase();
      const active = activeRegion?.trim().toLowerCase();

      if (!active || orgRegion === active) {
        o.locations.forEach((loc) => {
          if (loc.city) set.add(loc.city);
        });
      }
    });

    return Array.from(set).sort();
  }, [activeRegion]);

  return cities;
}

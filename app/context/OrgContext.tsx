"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { SelectedOrg, OrgContextType, Org } from "@/types/types";

const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  // ✅ neutral defaults for SSR
  const [savedOrgs, setSavedOrgs] = useState<Org[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null);

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
    localStorage.setItem("selectedCategories", JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  useEffect(() => {
    localStorage.setItem("selectedCities", JSON.stringify(selectedCities));
  }, [selectedCities]);

  // actions
  const toggleSavedOrg = (org: Org) => {
    setSavedOrgs((prev) =>
      prev.some((o) => o.id === org.id)
        ? prev.filter((o) => o.id !== org.id)
        : [...prev, org]
    );
  };

  const savedOrgIds = useMemo(() => new Set(savedOrgs.map((o) => o.id)), [savedOrgs]);
  const isSaved = (orgId: string) => savedOrgIds.has(orgId);

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
        // clearSavedOrgs,
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

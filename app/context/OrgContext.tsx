"use client";

import { createContext, useContext, useState } from "react";
import {  SelectedOrg } from "@/types/types";
import { OrgContextType } from "@/types/types";




const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null);

  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

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

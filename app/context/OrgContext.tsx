"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Org, SelectedOrg, OrgContextType } from "@/types/types";

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null);
  const [savedOrgs, setSavedOrgs] = useState<Org[]>(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("savedOrgs");
      return data ? JSON.parse(data) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("savedOrgs", JSON.stringify(savedOrgs));
  }, [savedOrgs]);

  const addOrg = (org: Org) => {
    setSavedOrgs((prev) => {
      if (!prev.find((o) => o.id === org.id)) return [...prev, org];
      return prev;
    });
  };

  return (
    <OrgContext.Provider value={{ selectedOrg, setSelectedOrg, savedOrgs, addOrg }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) throw new Error("useOrg must be used within OrgProvider");
  return context;
}

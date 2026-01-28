// components/RegionSelectorList.tsx
"use client";

import { useOrg } from "@/app/context/OrgContext";
import { Button } from "./button";

const REGION_BUTTONS = [
  { name: "Nord", value: "nord" },
  { name: "Centre", value: "centre" },
  { name: "Sud", value: "sud" },
];

interface RegionSelectorProps {
  onRegionSelect?: (region: string) => void;
}

export function RegionSelectorList({ onRegionSelect }: RegionSelectorProps) {
  const { activeRegion, setActiveRegion } = useOrg();

  const handleSelect = (regionValue: string) => {
    setActiveRegion(regionValue);
    if (onRegionSelect) onRegionSelect(regionValue);
  };

  // If a region is already active, hide the buttons
  if (activeRegion) return null;

  return (
    <div className="flex flex-wrap gap-10 items-center flex-col justify-evenly">
      <span className="text-md font-semibold">Choisissez une région</span>
      {REGION_BUTTONS.map((region) => (
        <Button
          key={region.value}
          onClick={() => handleSelect(region.value)}
          className="
           h-18 w-18 rounded-full
          shadow-lg hover:scale-110 transition-transform
          text-lg font-semibold
          md:h-28 md:w-28
        "
        >
          {region.name}
        </Button>
      ))}
    </div>
  );
}

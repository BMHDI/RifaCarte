"use client";

import Map, {
  NavigationControl,
  Marker,
  Popup,
  Source,
  Layer,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useRef, useEffect, useMemo } from "react";
import organizations from "@/lib/org.json";
import { MapPin } from "lucide-react";
import francophoneRegions from "@/lib/francophone-regions.json";
import { regionFill, regionBorder } from "@/lib/mapstyles";
import { useOrg } from "@/app/context/OrgContext";
import { MapRef } from "react-map-gl/mapbox";
import { OrgCard } from "../ui/OrgCard";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";


export function MapView() {

  const mapRef = useRef<MapRef | null>(null);
  const {
    selectedOrg,
    setSelectedOrg,
    activeRegion,
    setActiveRegion,
    viewState,
    setViewState,
    setMapInstance,
  } = useOrg();
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toggleSidebar, state } = useSidebar();
const isMobile = useIsMobile()
  // Handle flying to selected org location
  useEffect(() => {
    if (selectedOrg?.location && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedOrg.location.lng, selectedOrg.location.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [selectedOrg?.location]);

  // Flatten all locations for rendering
  const allMarkers = useMemo(() => {
    return organizations
      .filter((org) => org.id)
      .flatMap((org) =>
        org.locations
          .filter((l) => l.lat !== null && l.lng !== null)
          .map((loc) => ({
            org,
            location: loc,
          })),
      );
  }, []);

  // ---- Compute region centers for clickable markers ----
  const regionCenters = useMemo(() => {
    return francophoneRegions.features.map((feature) => {
      const coords = feature.geometry.coordinates[0]; // Polygon
      const lats = coords.map((c) => c[1]);
      const lngs = coords.map((c) => c[0]);
      const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const lng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      return { name: feature.properties.name, lat, lng };
    });
  }, []);

  // Determine which markers to show
  // ---- Filter markers based on active region ----
  const markersToShow = useMemo(() => {
    if (!activeRegion) return allMarkers;
    return allMarkers.filter(
      (m) =>
        m.org.region?.trim().toLowerCase() ===
        activeRegion.trim().toLowerCase(),
    );
  }, [activeRegion, allMarkers]);

  // ---- Fly to region when activeRegion changes ----
  useEffect(() => {
    if (!activeRegion || !mapRef.current) return;

    // Get all pins in this region
    const pins = allMarkers.filter(
      (m) =>
        m.org.region?.trim().toLowerCase() ===
        activeRegion?.trim().toLowerCase(),
    );

    const lats = pins.map((p) => p.location.lat);
    const lngs = pins.map((p) => p.location.lng);
    const north = Math.max(...lats);
    const south = Math.min(...lats);
    const east = Math.max(...lngs);
    const west = Math.min(...lngs);

    mapRef.current.fitBounds(
      [
        [west, south],
        [east, north],
      ],
      { padding: 80 },
    );
  }, [activeRegion, allMarkers]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/bmhdi/cmkoaod33000k01r83dx855i3"
        style={{ width: "100%", height: "100%" }}
       onLoad={(e) => {
    setMapLoaded(true);
    setMapInstance(e.target); // <-- e.target is the Mapbox GL JS instance
  }}
        
      >
        <NavigationControl position="top-right" />

        {/* Regions GeoJSON layers */}
        {mapLoaded && (
          <Source
            id="francophone-regions"
            type="geojson"
            data={francophoneRegions as GeoJSON.FeatureCollection}
          >
            <Layer {...regionFill} />
            <Layer {...regionBorder} />
          </Source>
        )}

        {/* Region clickable center markers */}
        {regionCenters.map((region) => {
  const isActive =
    activeRegion?.trim().toLowerCase() === region.name.trim().toLowerCase();

  if (isActive) return null; // ✅ hide this region button

  return (
    <Marker
      key={`region-${region.name}`}
      longitude={region.lng}
      latitude={region.lat}
      anchor="center"
    onClick={(e) => {
    e.originalEvent.stopPropagation();
    setActiveRegion(region.name);
    if (isMobile  && state == "expanded") {
      toggleSidebar(); // only open when needed
    }
  }}
    >
      <Button
      
        className="
           h-18 w-18 rounded-full
          shadow-lg hover:scale-110 transition-transform
          text-lg font-semibold
        "
      >
        {region.name}
      </Button>
    </Marker>
  );
})}
        

        {/* Render org markers */}
        {activeRegion && markersToShow.map(({ org, location }, i) => (
          <Marker
            key={`org-${org.id}-${i}`}
            longitude={location.lng!}
            latitude={location.lat!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedOrg({ org, location });
            }}
          >
            <MapPin
              size={selectedOrg?.location === location ? 30 : 24}
              className={
                selectedOrg?.location === location
                  ? "text-blue-600"
                  : "text-red-500 hover:scale-110 transition-transform cursor-pointer"
              }
              fill="currentColor"
            />
          </Marker>
        ))}

        {/* Popup for selected org */}
        {selectedOrg?.location && (
          <Popup
            longitude={selectedOrg.location.lng}
            latitude={selectedOrg.location.lat}
            anchor="top"
            offset={10}
            closeOnClick={false}
            onClose={() => setSelectedOrg(null)}
          >
            <div className="max-w-md bg-white overflow-hidden">
              <OrgCard
                image_url={selectedOrg.org?.image_url ?? ""}
                name={selectedOrg.org?.name ?? "Unknown"}
                phone={selectedOrg.org?.contact?.phone ?? ""}
                address={selectedOrg.location.address ?? ""}
                category={selectedOrg.org?.category}
                onDetails={() => console.log("Details", selectedOrg.org?.name)}
                onShare={() => console.log("Share", selectedOrg.org?.name)}
              />
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

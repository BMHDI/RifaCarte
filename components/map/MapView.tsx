"use client";

import Map, { NavigationControl, Marker, Popup, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useRef, useEffect } from "react";
import organizations from "@/lib/org.json";
import { MapPin } from "lucide-react";
import francophoneRegions from "@/lib/francophone-regions.json";
import { regionFill, regionLabels, regionBorder } from "@/lib/mapstyles";
import { useOrg } from "@/app/context/OrgContext";

export function MapView() {
  const mapRef = useRef<any>(null);
  const { selectedOrg, setSelectedOrg } = useOrg();
  const [mapLoaded, setMapLoaded] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: -113.4711,
    latitude: 53.5198,
    zoom: 5,
  });

  // Fly to selected location
  useEffect(() => {
    if (selectedOrg?.location && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedOrg.location.lng, selectedOrg.location.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [selectedOrg]);

  // Determine which markers to render
const markers = selectedOrg
  ? selectedOrg.location
    ? [selectedOrg.location] // only selected location
    : selectedOrg.org?.locations // all locations of the selected org
  : organizations.flatMap((org) => org.locations.map((loc) => ({ ...loc, org })) as any); // all orgs & locations;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map
        ref={mapRef}
        initialViewState={viewState}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/bmhdi/cmkoaod33000k01r83dx855i3"
        style={{ width: "100%", height: "100%" }}
        onMove={(e) => setViewState(e.viewState)}
        onLoad={() => setMapLoaded(true)}
      >
        <NavigationControl position="top-right" />

        {/* Francophone regions */}
        {mapLoaded && (
          <Source
            id="francophone-regions"
            type="geojson"
            data={francophoneRegions as any}
          >
            <Layer {...regionFill} />
            <Layer {...regionBorder} />
            <Layer {...regionLabels} />
          </Source>
        )}

        {/* Markers */}
        {markers.map((loc: any, index: number) => (
          <Marker
            key={`${loc.org?.id || "org"}-${index}`}
            longitude={loc.lng}
            latitude={loc.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              if (loc.org) {
                setSelectedOrg({ org: loc.org, location: loc }); // select location
              }
            }}
          >
            <MapPin size={40} fill="red" />
          </Marker>
        ))}

        {/* Popup */}
     {selectedOrg?.location && (
  <Popup
    longitude={selectedOrg.location.lng}
    latitude={selectedOrg.location.lat}
    anchor="top"
    onClose={() => setSelectedOrg(null)}
    closeOnClick={false}
  >
    <div className="text-sm font-medium">
      {selectedOrg?.org?.name ?? 'Unknown'}
    </div>
    {selectedOrg.location.address && (
      <div className="text-xs text-gray-500">{selectedOrg.location.address}</div>
    )}
  </Popup>
)}
      </Map>
    </div>
  );
}

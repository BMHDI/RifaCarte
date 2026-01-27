"use client";

import Map, {
  NavigationControl,
  Marker,
  Popup,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useRef, useEffect, useMemo } from "react";
import organizations from "@/lib/org.json";
import { MapPin } from "lucide-react";
import francophoneRegions from "@/lib/francophone-regions.json";
import { Source, Layer } from "react-map-gl/mapbox";
import { regionFill, regionLabels, regionBorder } from "@/lib/mapstyles";
import { useOrg } from "@/app/context/OrgContext";
import { MapRef } from "react-map-gl/mapbox";
import { OrgCard } from "../ui/OrgCard";

export function MapView() {
  const mapRef = useRef<MapRef | null>(null);
  const { selectedOrg, setSelectedOrg } = useOrg();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: -113.4711,
    latitude: 53.5198,
    zoom: 5,
  });

  // Handle flying to selected location
  useEffect(() => {
    if (selectedOrg?.location && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedOrg.location.lng, selectedOrg.location.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [selectedOrg?.location]);

  // Flatten all locations for rendering when nothing is selected
  const allMarkers = useMemo(() => {
    return organizations
      .filter((org) => org.id)
      .flatMap((org) =>
        org.locations
          .filter((l) => l.lat !== null && l.lng !== null)
          .map((loc) => ({
            org,
            location: loc,
          }))
      );
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/bmhdi/cmkoaod33000k01r83dx855i3"
        style={{ width: "100%", height: "100%" }}
        onLoad={() => setMapLoaded(true)}
      >
        <NavigationControl position="top-right" />

        {/* Francophone regions Background Layers */}
        {mapLoaded && (
          <Source
            id="francophone-regions"
            type="geojson"
            data={francophoneRegions as GeoJSON.FeatureCollection}
          >
            <Layer {...regionFill} />
            <Layer {...regionBorder} />
            <Layer {...regionLabels} />
          </Source>
        )}

        {/* RENDER LOGIC:
          If an org is selected, show its specific markers.
          Otherwise, show markers for every organization in the JSON.
        */}
        {!selectedOrg ? (
          allMarkers.map(({ org, location }, i) => (
            <Marker
              key={`all-${org.id}-${i}`}
              longitude={location.lng!}
              latitude={location.lat!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedOrg({ org, location });
              }}
            >
              <MapPin size={24} className="text-red-500 hover:scale-110 transition-transform cursor-pointer" fill="currentColor" />
            </Marker>
          ))
        ) : (
          selectedOrg.org?.locations.map((loc, i) => (
            <Marker
              key={`selected-${i}`}
              longitude={loc.lng!}
              latitude={loc.lat!}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedOrg({ org: selectedOrg.org, location: loc });
              }}
            >
              <MapPin size={30} className="text-blue-600" fill="currentColor" />
            </Marker>
          ))
        )}

        {/* Popup for the active selection */}
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
                logo=""
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
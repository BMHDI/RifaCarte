"use client";

import Map, {
  NavigationControl,
  Marker,
  Popup,
  Source,
  Layer,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useRef, useEffect } from "react";
import organizations from "@/lib/org.json";
import { MapPin } from "lucide-react";
import francophoneRegions from "@/lib/francophone-regions.json";
import { regionFill, regionLabels, regionBorder } from "@/lib/mapstyles";
import { useOrg } from "@/app/context/OrgContext";
import { useSidebar } from "../ui/sidebar";
import { MapRef } from "react-map-gl/mapbox";
import { OrgCard } from "../ui/OrgCard";

export function MapView() {
  const mapRef = useRef<MapRef | null>(null);
  const { selectedOrg, setSelectedOrg } = useOrg();
  const [mapLoaded, setMapLoaded] = useState(false);
  const { toggleSidebar, state } = useSidebar();
  const [viewState, setViewState] = useState({
    longitude: -113.4711,
    latitude: 53.5198,
    zoom: 5,
  });

  // Fly to a single location
  useEffect(() => {
    if (selectedOrg?.location && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedOrg.location.lng, selectedOrg.location.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [selectedOrg?.location]);

  // Zoom to show all locations if multiple
  useEffect(() => {
    if (
      selectedOrg?.locations &&
      selectedOrg.locations.length > 1 &&
      mapRef.current
    ) {
      const lats = selectedOrg.locations.map((l) => l.lat!).filter(Boolean);
      const lngs = selectedOrg.locations.map((l) => l.lng!).filter(Boolean);
      if (!lats.length || !lngs.length) return;

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 200, duration: 1000 },
      );
    }
  }, [selectedOrg?.locations]);

  // Determine which markers to render
  const markers = selectedOrg
    ? selectedOrg.location
      ? [selectedOrg.location] // only selected location
      : selectedOrg.org?.locations // all locations of the selected org
    : organizations.flatMap(
        (org) =>
          org.locations.map((loc) => ({
            ...loc,
            org,
          })) as unknown as Location[],
      ); // all orgs & locations;

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
            data={francophoneRegions as GeoJSON.FeatureCollection}
          >
            <Layer {...regionFill} />
            <Layer {...regionBorder} />
            <Layer {...regionLabels} />
          </Source>
        )}

        {/* Markers */}
        {selectedOrg ? (
          selectedOrg.location ? (
            // single selected location
            <Marker
              longitude={selectedOrg.location.lng}
              latitude={selectedOrg.location.lat}
              anchor="bottom"
              onClick={(e) => e.originalEvent.stopPropagation()}
            >
              <MapPin size={40} fill="red" />
            </Marker>
          ) : (
            // multiple locations
            selectedOrg.locations?.map((loc, index) => (
              <Marker
                key={index}
                longitude={loc.lng}
                latitude={loc.lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  // select this location and fly
                  setSelectedOrg({ org: selectedOrg.org, location: loc });
                }}
              >
                <MapPin size={40} fill="blue" />{" "}
                {/* maybe blue to indicate multiple */}
              </Marker>
            ))
          )
        ) : (
          // default: all orgs
          organizations
            .flatMap((org) =>
              org.locations.map((loc) => ({
                ...loc,
                org,
                lat: loc.lat !== null ? loc.lat : 0, // Provide a default value of 0 if lat is null
                lng: loc.lng !== null ? loc.lng : 0, // Provide a default value of 0 if lng is null
              })),
            )
            .map((loc, index) => (
              <Marker
                key={index}
                longitude={loc.lng || 0}
                latitude={loc.lat || 0}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedOrg({ org: loc.org, location: loc });
                }}
              >
                <MapPin size={40} fill="red" />
              </Marker>
            ))
        )}

        {/* Popup */}
        {selectedOrg?.location && (
          <Popup
            key={selectedOrg.location.lng + selectedOrg.location.lat}
            longitude={selectedOrg.location.lng}
            latitude={selectedOrg.location.lat}
            anchor="top"
            closeOnClick={false}
            onClose={() => {
              setSelectedOrg(null);
              mapRef.current?.flyTo({
                zoom: 10,
                essential: true,
              });
            }}
           
          >
           
              {" "}
              {/* constrain popup width */}
              <div className="max-w-md rounded-lg shadow-lg bg-white overflow-hidden mapboxgl-popup-content">

              <OrgCard
                logo=""
                name={selectedOrg.org?.name ?? "Unknown"}
                phone={selectedOrg.org?.contact?.phone ?? ""}
                address={selectedOrg.location.address ?? ""}
                category={selectedOrg.org?.category}
                onDetails={() => {
                  // maybe open sidebar or a modal
                  console.log("Voir plus", selectedOrg.org?.name);
                }}
                onShare={() => {
                  console.log("Partager", selectedOrg.org?.name);
                }}
              />
              </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

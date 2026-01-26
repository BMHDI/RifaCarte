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
import { MapRef } from "react-map-gl/mapbox";
import { OrgCard } from "../ui/OrgCard";
import { OrgLocation } from "@/types/types";
import {Point} from "geojson";

const EPSILON = 0.000001;

export function MapView() {
  const mapRef = useRef<MapRef | null>(null);
  const { selectedOrg, setSelectedOrg } = useOrg();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: -113.4711,
    latitude: 53.5198,
    zoom: 5,
  });

  // Fly to a single location when selected
  useEffect(() => {
    if (selectedOrg?.location && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedOrg.location.lng, selectedOrg.location.lat],
        zoom: 14,
        essential: true,
      });
    }
  }, [selectedOrg?.location]);

  // Fit bounds for multiple locations
  useEffect(() => {
    if (
      !selectedOrg?.locations ||
      selectedOrg.locations.length < 2 ||
      !mapRef.current
    )
      return;

    const lats = selectedOrg.locations.map((l) => l.lat!).filter(Boolean);
    const lngs = selectedOrg.locations.map((l) => l.lng!).filter(Boolean);

    if (!lats.length || !lngs.length) return;

    mapRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 200, duration: 1000 },
    );
  }, [selectedOrg?.locations]);

  // Build GeoJSON for clusters (all orgs)
  const geojson = {
    type: "FeatureCollection",
    features: organizations.flatMap((org) =>
      org.locations
        .filter((l) => l.lat !== null && l.lng !== null)
        .map((loc) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [loc.lng!, loc.lat!] },
          properties: {
            orgId: org.id,
            orgName: org.name,
            address: loc.address ?? "",
          },
        })),
    ),
  };

  // Handle map clicks (clusters & unclustered points)
  const handleMapClick = (e: any) => {
    if (!mapRef.current) return;

    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ["clusters", "unclustered-point"],
    });

    if (!features?.length) return;

    const feature = features[0];

    // Cluster click → zoom in
   if (feature?.layer?.id === "clusters") {
  const clusterId = feature.properties?.cluster_id;
  const source = mapRef.current.getSource("orgs") as any;

  // Get all points in this cluster
  source.getClusterLeaves(clusterId, Infinity, 0, (err: any, leaves: any[]) => {
    if (err || !mapRef.current || leaves.length === 0) return;

    const lats = leaves.map((leaf) => leaf.geometry.coordinates[1]);
    const lngs = leaves.map((leaf) => leaf.geometry.coordinates[0]);

    mapRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 100, duration: 500 }
    );
  });
  return;
}


    // Unclustered point → select single location
    if (feature?.layer?.id === "unclustered-point" )  {
const [lng, lat] = (feature.geometry as Point).coordinates as [number, number];
      const orgId = feature.properties?.orgId;
      const org = organizations.find((o) => o.id === orgId);
      if (!org) return;

      const location = org.locations.find(
        (l) =>
          l.lat !== null &&
          l.lng !== null &&
          Math.abs(l.lat - lat) < EPSILON &&
          Math.abs(l.lng - lng) < EPSILON,
      );
      if (!location) return;

      setSelectedOrg({ org, location });
    }
  };

  // Determine which markers to render
  let markerLocations: OrgLocation[] = [];
  if (selectedOrg?.location) markerLocations = [selectedOrg.location];
  else if (selectedOrg?.locations) markerLocations = selectedOrg.locations;

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
        onClick={handleMapClick}
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

        {/* Clusters only when no org selected */}
        {!selectedOrg && (
          <Source
            id="orgs"
            type="geojson"
            data={geojson as GeoJSON.FeatureCollection}
            cluster
            clusterMaxZoom={20}
            clusterRadius={30}
          >
            <Layer
              id="clusters"
              type="circle"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": "#2563eb",
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  20,
                  10,
                  25,
                  30,
                  30,
                ],
                "circle-opacity": 0.85,
              }}
            />
            <Layer
              id="cluster-count"
              type="symbol"
              filter={["has", "point_count"]}
              layout={{
                "text-field": ["get", "point_count_abbreviated"],
                "text-size": 12,
              }}
              paint={{ "text-color": "#fff" }}
            />
            <Layer
              id="unclustered-point"
              type="circle"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-color": "#ef4444",
                "circle-radius": 10,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
              }}
            />
          </Source>
        )}

        {/* Markers for selected org */}
        {markerLocations.map((loc, i) => (
          <Marker
            key={i}
            longitude={loc.lng!}
            latitude={loc.lat!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedOrg({ org: selectedOrg?.org, location: loc });
            }}
          >
            <MapPin size={30} fill="blue" />
          </Marker>
        ))}

        {/* Popup for single location */}
       {selectedOrg?.location && (
  <Popup
    longitude={selectedOrg.location.lng}
    latitude={selectedOrg.location.lat}
    anchor="top"
    closeOnClick={false}
    onClose={() => {
      // Always reset to show all orgs
      setSelectedOrg(null);
    }}
  >
    <div className="max-w-md rounded-lg shadow-lg bg-white overflow-hidden mapboxgl-popup-content">
      <OrgCard
        logo=""
        name={selectedOrg.org?.name ?? "Unknown"}
        phone={selectedOrg.org?.contact?.phone ?? ""}
        address={selectedOrg.location.address ?? ""}
        category={selectedOrg.org?.category}
        onDetails={() => console.log("Voir plus", selectedOrg.org?.name)}
        onShare={() => console.log("Partager", selectedOrg.org?.name)}
      />
    </div>
  </Popup>
)}
      </Map>
    </div>
  );
}

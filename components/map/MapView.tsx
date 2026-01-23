"use client";

import Map, {
  NavigationControl,
  Marker,
  Popup,
  Source,
  Layer,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import organizations from "@/lib/org.json";
import { MapPin } from "lucide-react";
import francophoneRegions from "@/lib/francophone-regions.json";
import { regionFill, regionLabels, regionBorder } from "@/lib/mapstyles";

export function MapView() {
  const [mapLoaded, setMapLoaded] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: -113.4711,
    latitude: 53.5198,
    zoom: 5, // zoom out to see multiple regions
  });
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map
        initialViewState={viewState}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/bmhdi/cmkoaod33000k01r83dx855i3"
        style={{ width: "100%", height: "100%" }}
        onMove={(e) => setViewState(e.viewState)}
        onLoad={() => setMapLoaded(true)}
      >
        <NavigationControl position="top-right" />

        {/* ✅ Add the Francophone regions */}
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

        {/* ✅ MARKERS & POPUP */}
        {organizations.map((org) =>
          org.locations
            .filter((loc) => loc.lat != null && loc.lng != null) // only valid coords
            .map((loc, index) => (
              <Marker
                key={`${org.id}-${index}`}
                longitude={loc.lng!} // safe because of filter
                latitude={loc.lat!}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedOrg({ org, location: loc }); // store org + clicked location
                }}
              >
                <MapPin size={40} fill="red" />
              </Marker>
            )),
        )}

        {/* ✅ POPUP */}
        {selectedOrg?.location && (
          <Popup
            longitude={selectedOrg.location.lng!}
            latitude={selectedOrg.location.lat!}
            anchor="top"
            onClose={() => setSelectedOrg(null)}
            closeOnClick={false}
          >
            <div className="text-sm font-medium">{selectedOrg.org.name}</div>
            {selectedOrg.location.address && (
              <div className="text-xs text-gray-500">
                {selectedOrg.location.address}
              </div>
            )}
          </Popup>
        )}
      </Map>
    </div>
  );
}

"use client"

import Map, { NavigationControl, Marker, Popup } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { useState } from "react"
import organizations from "@/lib/org.json"
import { MapPin } from 'lucide-react';


export function MapView() {
  const [viewState, setViewState] = useState({
    longitude:-113.4711,
    
    latitude:   53.5198,
    zoom: 14,
  })

  const [selectedOrg, setSelectedOrg] = useState<any>(null) // will create a ty

  return (
    <div style={{ width: "100vw", height: "100%" }}>
      <Map
        initialViewState={viewState}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100dvw", height: "100%" }}
        onMove={(e) => setViewState(e.viewState)}
      >
        <NavigationControl position="top-right" />

        {/* ✅ MARKERS */}
        {organizations.map((org) => (
          <Marker
            key={org.id}
            longitude={org.map.lng}
            latitude={org.map.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setSelectedOrg(org)
            }}
          >
          <MapPin/>
          </Marker>
        ))}

        {/* ✅ POPUP */}
        {selectedOrg && (
          <Popup
            longitude={selectedOrg.map.lng}
            latitude={selectedOrg.map.lat}
            anchor="top"
            onClose={() => setSelectedOrg(null)}
            closeOnClick={false}
          >
            <div className="text-sm font-medium">
              {selectedOrg.name}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}

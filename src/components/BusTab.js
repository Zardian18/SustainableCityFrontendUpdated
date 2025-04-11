import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import useAuthStore from "../store/useAuthStore";
// Import react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Dublin configuration
const DUBLIN_CENTER = [53.3498, -6.2603];
const CONGESTION_RADIUS = 400; // meters
const MIN_BUSES_FOR_CONGESTION = 10;
const DUBLIN_DESTINATIONS = [
  [53.34971, -6.26029], // O'Connell St Upper (Stop 1)
  [53.34528, -6.25872], // Christchurch Place (Stop 5079)
  [53.34699, -6.28734], // Heuston Station (Stop 7183)
  [53.34379, -6.29172], // Guinness Storehouse (Stop 4802)
  [53.33862, -6.26725], // St. James's Hospital (Stop 4150)
  [53.35112, -6.26018], // Parnell Square East (Stop 2)
  [53.34156, -6.25944], // Dublin Castle (Stop 1987)
  [53.34722, -6.25917], // Four Courts (Stop 1478)
  [53.35361, -6.24419], // Connolly Station (Stop 135)
  [53.33941, -6.24895], // St. Stephen's Green South (Stop 769)
  [53.38915, -6.37884], // Blanchardstown SC (Stop 7027)
  [53.4567, -6.218], // Swords Bus Depot (Stop 7910)
  [53.2879, -6.3577], // Tallaght Hospital (Stop 6075)
  [53.29304, -6.13618], // Dún Laoghaire Station (Stop 2029)
  [53.33558, -6.42857], // Clondalkin Village (Stop 6265)
  [53.28321, -6.43885], // Neilstown Roundabout (Stop 6151)
  [53.36421, -6.1239], // Donaghmede SC (Stop 2275)
  [53.40658, -6.15854], // Dublin Airport T2 (Stop 7570)
  [53.29762, -6.23098], // Dundrum Luas (Stop 3265)
  [53.41856, -6.18066], // Dublin Airport T1 (Stop 7571)
];

// Custom icons
const BusIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const DestinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const CongestionIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// BusHeatmap component (unchanged)
const BusHeatmap = () => {
  const map = useMap();
  const [heatData, setHeatData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const cached = getCachedData("busHeatmap");
        if (cached) {
          setHeatData(cached);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/dashboard/bus_heatmap");
        if (response.data?.bus_heatmap) {
          const points = response.data.bus_heatmap.map((p) => [p[0], p[1], p[2]]);
          setHeatData(points);
          setCachedData("busHeatmap", points);
        }
      } catch (err) {
        console.error("API Error:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (heatData.length > 0) {
      const heatLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.4: "blue", 0.6: "lime", 0.8: "yellow", 1.0: "red" },
      }).addTo(map);
      return () => map.removeLayer(heatLayer);
    }
  }, [heatData, map]);

  return null;
};

// CongestionMarkers component (unchanged)
const CongestionMarkers = ({ zones }) => {
  const map = useMap();

  useEffect(() => {
    if (!zones.length) return;

    const markers = zones.map((zone) => {
      const marker = L.marker([zone.center.lat, zone.center.lng], { icon: CongestionIcon })
        .bindPopup(`Congestion Zone ${zone.id}<br>Buses: ${zone.buses.length}`);
      return marker.addTo(map);
    });

    return () => markers.forEach((marker) => map.removeLayer(marker));
  }, [zones, map]);

  return null;
};

// RouteDisplay component (unchanged)
const RouteDisplay = ({ start, end, busId }) => {
  const map = useMap();
  const [routes, setRoutes] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!start || !end) return;

    // Clear previous markers
    markers.forEach((marker) => map.removeLayer(marker));

    // Create new markers with custom icons
    const busMarker = L.marker(start, {
      icon: BusIcon,
      title: `Bus ${busId} Start`,
    }).bindPopup(`Bus ${busId} Location`);

    const destMarker = L.marker(end, {
      icon: DestinationIcon,
      title: `Bus ${busId} Destination`,
    }).bindPopup(`Bus ${busId} Destination`);

    // Add markers to map and state
    busMarker.addTo(map);
    destMarker.addTo(map);
    setMarkers([busMarker, destMarker]);

    // Fit map to show both markers with padding
    const bounds = L.latLngBounds([start, end]);
    map.fitBounds(bounds.pad(0.2));

    const fetchRoutes = async () => {
      try {
        const [normalRes, sustainableRes] = await Promise.all([
          axios.get("http://localhost:5000/api/dashboard/normal_route", {
            params: { start_lat: start[0], start_lon: start[1], end_lat: end[0], end_lon: end[1] },
          }),
          axios.get("http://localhost:5000/api/dashboard/sustainable_route", {
            params: { start_lat: start[0], start_lon: start[1], end_lat: end[0], end_lon: end[1] },
          }),
        ]);

        setRoutes({
          normal: normalRes.data.normal_route?.route || [],
          sustainable: sustainableRes.data.sustainable_route?.route || [],
        });
      } catch (err) {
        console.error("Route Error:", err);
        setRoutes(null);
      }
    };

    fetchRoutes();
  }, [start, end, busId, map]);

  useEffect(() => {
    if (!routes) return;

    const layers = [];
    const colors = {
      normal: "blue",
      sustainable: "green",
    };

    Object.entries(routes).forEach(([routeType, coordinates]) => {
      if (coordinates.length > 0) {
        const layer = L.polyline(coordinates, {
          color: colors[routeType],
          weight: 4,
          opacity: 0.8,
        }).bindPopup(`${routeType.replace("_", " ").toUpperCase()} Route`);
        layer.addTo(map);
        layers.push(layer);
      }
    });

    return () => layers.forEach((layer) => map.removeLayer(layer));
  }, [routes, map]);

  return null;
};

// RerouteButtonControl component (unchanged)
const RerouteButtonControl = ({ selectedBus, handleRerouteRequest, role }) => {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "bottomleft" });

    control.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar reroute-control");
      div.innerHTML = `
        <button
          id="reroute-btn"
          style="
            padding: 8px 12px;
            background-color: ${selectedBus && role === "manager" ? "#28a745" : "#ccc"};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: ${selectedBus && role === "manager" ? "pointer" : "not-allowed"};
            font-size: 14px;
          "
          ${!selectedBus || role !== "manager" ? "disabled" : ""}
        >
          Send Reroute Request
        </button>
      `;
      L.DomEvent.on(div.querySelector("#reroute-btn"), "click", () => {
        if (selectedBus && role === "manager") {
          handleRerouteRequest(selectedBus.busId, selectedBus.start, selectedBus.end);
        }
      });
      return div;
    };

    control.addTo(map);
    return () => control.remove();
  }, [map, selectedBus, handleRerouteRequest, role]);

  return null;
};

const BusTab = () => {
  const [congestionZones, setCongestionZones] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busDestinations] = useState(() => new Map());
  const { user } = useAuthStore();
  const { role, username } = user || {};

  useEffect(() => {
    const processHeatData = async () => {
      const heatData = getCachedData("busHeatmap") || [];
      const zones = [];

      heatData.forEach((point) => {
        const latLng = L.latLng(point[0], point[1]);
        let isInZone = false;

        for (const zone of zones) {
          if (latLng.distanceTo(zone.center) <= CONGESTION_RADIUS) {
            zone.buses.push(point);
            isInZone = true;
            break;
          }
        }

        if (!isInZone) {
          zones.push({ center: latLng, buses: [point], id: zones.length + 1 });
        }
      });

      const congested = zones.filter((zone) => zone.buses.length >= MIN_BUSES_FOR_CONGESTION).slice(0, 5);
      const usedIds = new Set();
      const finalZones = congested.map((zone) => ({
        ...zone,
        buses: zone.buses.map(() => {
          let id;
          do {
            id = Math.floor(Math.random() * 2990) + 10;
          } while (usedIds.has(id));
          usedIds.add(id);
          return id;
        }),
      }));

      setCongestionZones(finalZones);
    };

    processHeatData();
  }, []);

  const getBusDestination = (busId) => {
    if (!busDestinations.has(busId)) {
      const randomDest = DUBLIN_DESTINATIONS[Math.floor(Math.random() * DUBLIN_DESTINATIONS.length)];
      busDestinations.set(busId, randomDest);
    }
    return busDestinations.get(busId);
  };

  const handleRerouteRequest = async (busId, start, end) => {
    try {
      const rerouteData = {
        busId: busId,
        start: { lat: start[0], lng: start[1] },
        end: { lat: end[0], lng: end[1] },
        manager_name: username,
        mode_of_transport: "bus", // Explicitly set mode for clarity
      };

      const response = await axios.post(
        "http://localhost:5000/api/notification/reroute-request",
        rerouteData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Reroute request sent successfully:", response.data);
      const notification = response.data.notification;
      // Show success toast
      toast.success(
        `Reroute request for Bus ${busId} sent successfully!\nStatus: ${notification.status}\nTimestamp: ${notification.timestamp}`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (err) {
      console.error("Error sending reroute request:", err);
      const errorMessage = err.response?.data?.error || "Network error - ensure backend is running";
      // Show error toast
      toast.error(`Failed to send reroute request: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
      {/* ToastContainer for rendering toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div
        style={{
          width: "300px",
          padding: "20px",
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          backgroundColor: "#f8f9fa",
        }}
      >
        <h2>Congestion Zones</h2>
        {congestionZones.map((zone) => (
          <div key={zone.id} style={{ marginBottom: "20px" }}>
            <h3>Zone {zone.id} ({zone.buses.length} buses)</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {zone.buses.map((busId) => (
                <div key={busId} style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() =>
                      setSelectedBus({
                        busId,
                        start: [zone.center.lat, zone.center.lng],
                        end: getBusDestination(busId),
                      })
                    }
                    style={{
                      padding: "8px 12px",
                      backgroundColor: selectedBus?.busId === busId ? "#007bff" : "#e9ecef",
                      color: selectedBus?.busId === busId ? "white" : "#212529",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Bus {busId}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <MapContainer center={DUBLIN_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <BusHeatmap />
          <CongestionMarkers zones={congestionZones} />
          {selectedBus && (
            <RouteDisplay
              key={selectedBus.busId}
              start={selectedBus.start}
              end={selectedBus.end}
              busId={selectedBus.busId}
            />
          )}
          <RerouteButtonControl
            selectedBus={selectedBus}
            handleRerouteRequest={handleRerouteRequest}
            role={role}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default BusTab;
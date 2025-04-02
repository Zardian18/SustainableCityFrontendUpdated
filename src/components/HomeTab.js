import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import MapToggles from "./MapToggles";
import L from "leaflet";
import "./HomeTab.css";
import HeatmapLayer from "./HeatmapLayer";
import { getIconForCount } from "../utils/markerIconForEvent"; // Import the shared utility

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const eventIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2738/2738880.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const HomeTab = ({
  source,
  setSource,
  destination,
  setDestination,
  sourceSuggestions,
  setSourceSuggestions,
  destinationSuggestions,
  setDestinationSuggestions,
  sourcePosition,
  setSourcePosition,
  destinationPosition,
  setDestinationPosition,
  routes,
  setRoutes,
  loading,
  setLoading,
  aqiData,
  setAqiData,
  busHeatmapData,
  setBusHeatmapData,
  eventsData,
  setEventsData,
  bikeData,
  setBikeData,
  pedestrianData,
  setPedestrianData,
  toggles,
  setToggles,
}) => {
  const [selectedRoute, setSelectedRoute] = useState(null); // null = show all

  const fetchSuggestions = async (query, setSuggestions) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let newSourcePos = null;
      let newDestPos = null;

      if (source) {
        const sourceRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${source}&limit=1`
        );
        const sourceData = await sourceRes.json();
        if (sourceData.length > 0) {
          const { lat, lon } = sourceData[0];
          newSourcePos = [parseFloat(lat), parseFloat(lon)];
          setSourcePosition(newSourcePos);
        }
      }

      if (destination) {
        const destRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${destination}&limit=1`
        );
        const destData = await destRes.json();
        if (destData.length > 0) {
          const { lat, lon } = destData[0];
          newDestPos = [parseFloat(lat), parseFloat(lon)];
          setDestinationPosition(newDestPos);
        }
      }

      if (newSourcePos && newDestPos) {
        const apiUrl = `http://localhost:5000/api/dashboard/?start_lat=${newSourcePos[0]}&start_lon=${newSourcePos[1]}&end_lat=${newDestPos[0]}&end_lon=${newDestPos[1]}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Ensure route coordinates are in [lat, lon] array format
        const formatCoords = (route) =>
          (route || []).map((coord) =>
            Array.isArray(coord) ? coord : [coord.lat, coord.lon]
          );

        setRoutes({
          normal: formatCoords(data.normal_route?.route),
          sustainable: formatCoords(data.sustainable_route?.route),
          clean: formatCoords(data.clean_route?.route),
        });

        setAqiData(data.air_pollution?.data || []);
        setBusHeatmapData(data.bus_heatmap || []);
        setEventsData(data.events || []);
        setBikeData(data.bike_notifications?.notifications || []);

        // Format pedestrian data to include formattedTime and formattedDate
        const formattedPedestrianData = (data.pedestrian?.[0]?.data || []).map(
          (item) => ({
            ...item,
            formattedTime: new Date(item.datetime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            formattedDate: new Date(item.datetime).toLocaleDateString(),
          })
        );
        setPedestrianData(formattedPedestrianData);

        setSelectedRoute(null); // Show all on initial load
      }
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion, setInput, setSuggestions, setPosition) => {
    setInput(suggestion.display_name);
    setSuggestions([]);
    setPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
  };

  return (
    <div className="map-container">
      <div className="search-bar">
        <div className="search-inputs">
          <div className="input-container">
            <input
              type="text"
              placeholder="Source Location"
              value={source}
              onChange={(e) => {
                const value = e.target.value;
                setSource(value);
                fetchSuggestions(value, setSourceSuggestions);
              }}
              className="location-input"
            />
            {sourceSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {sourceSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() =>
                      handleSuggestionClick(
                        suggestion,
                        setSource,
                        setSourceSuggestions,
                        setSourcePosition
                      )
                    }
                    className="suggestion-item"
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="input-container">
            <input
              type="text"
              placeholder="Destination Location"
              value={destination}
              onChange={(e) => {
                const value = e.target.value;
                setDestination(value);
                fetchSuggestions(value, setDestinationSuggestions);
              }}
              className="location-input"
            />
            {destinationSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {destinationSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() =>
                      handleSuggestionClick(
                        suggestion,
                        setDestination,
                        setDestinationSuggestions,
                        setDestinationPosition
                      )
                    }
                    className="suggestion-item"
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={handleSearch} className="search-button">🔍</button>
        </div>
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      <MapToggles toggles={toggles} setToggles={setToggles} />

      {/* ROUTE FILTER BUTTONS */}
      <div className="route-buttons">
        <button
          className={selectedRoute === null ? "active" : ""}
          onClick={() => setSelectedRoute(null)}
        >
          All Routes
        </button>
        <button
          className={selectedRoute === "normal" ? "active" : ""}
          onClick={() => setSelectedRoute("normal")}
        >
          Normal
        </button>
        <button
          className={selectedRoute === "sustainable" ? "active" : ""}
          onClick={() => setSelectedRoute("sustainable")}
        >
          Sustainable
        </button>
        <button
          className={selectedRoute === "clean" ? "active" : ""}
          onClick={() => setSelectedRoute("clean")}
        >
          Clean
        </button>
      </div>

      <MapContainer
        center={[53.3498, -6.2603]}
        zoom={13}
        style={{ height: "calc(100vh - 64px)", width: "100%" }}
        whenCreated={(map) => {
          map.on("click", () => setSelectedRoute(null));
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {sourcePosition && (
          <Marker position={sourcePosition}>
            <Popup>Source: {source}</Popup>
          </Marker>
        )}

        {destinationPosition && (
          <Marker position={destinationPosition}>
            <Popup>Destination: {destination}</Popup>
          </Marker>
        )}

        {/* ROUTES DISPLAYED BASED ON selectedRoute */}
        {routes.normal.length > 0 && (selectedRoute === null || selectedRoute === "normal") && (
          <Polyline positions={routes.normal} color="blue" weight={5} opacity={1}>
            <Popup>Normal Route</Popup>
          </Polyline>
        )}

        {routes.sustainable.length > 0 && (selectedRoute === null || selectedRoute === "sustainable") && (
          <Polyline positions={routes.sustainable} color="green" weight={5} opacity={1}>
            <Popup>Sustainable Route</Popup>
          </Polyline>
        )}

        {routes.clean.length > 0 && (selectedRoute === null || selectedRoute === "clean") && (
          <Polyline positions={routes.clean} color="purple" weight={5} opacity={1}>
            <Popup>Clean Route</Popup>
          </Polyline>
        )}

        {toggles.AQI &&
          aqiData.map((point, index) => (
            <Marker
              key={index}
              position={[point.latitude, point.longitude]}
              icon={L.divIcon({
                className: "aqi-marker",
                html: `<div class="aqi-circle">${point.aqi.toFixed(1)}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
              })}
            >
              <Popup>
                <strong>AQI:</strong> {point.aqi}
                <br />
                <strong>Impact:</strong> {point.health_impact}
                <br />
                <strong>PM1:</strong> {point.pm1}
              </Popup>
            </Marker>
          ))}

        {/* Heatmap Layer */}
        {toggles.Heatmap && busHeatmapData.length > 0 && (
          <HeatmapLayer points={busHeatmapData} radius={20} blur={15} maxZoom={17} />
        )}

        {toggles.Events &&
          eventsData.length > 0 &&
          eventsData.map((event, index) => {
            const coords = event.location?.geo;
            if (!coords) return null;

            return (
              <Marker
                key={event.id || index}
                position={[coords.latitude, coords.longitude]}
                icon={eventIcon}
              >
                <Popup>
                  <strong>{event.name}</strong>
                  <br />
                  <em>{event.additionalType?.[0]}</em>
                  <br />
                  <small>
                    <strong>Starts:</strong>{" "}
                    {new Date(event.startDate).toLocaleString()}
                  </small>
                  <br />
                  <small>
                    <strong>Ends:</strong>{" "}
                    {new Date(event.endDate).toLocaleString()}
                  </small>
                  <br />
                  <br />
                  {event.description?.substring(0, 150)}...
                  <br />
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    More Info
                  </a>
                </Popup>
              </Marker>
            );
          })}

        {toggles.bike_stand &&
          bikeData.length > 0 &&
          bikeData.map((station, index) => (
            <Marker
              key={station.station_id || index}
              position={[station.position.lat, station.position.lng]}
              icon={L.divIcon({
                className: "bike-stand-marker",
                html: `<div class="bike-icon">🚲</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 26],
              })}
            >
              <Popup>
                <strong>Station:</strong> {station.station_name}
                <br />
                <strong>Status:</strong> {station.status}
                <br />
                <strong>Current Bikes:</strong> {station.current_bikes}
                <br />
                <strong>Predicted Bikes:</strong>{" "}
                {station.predicted_bikes.toFixed(1)}
                <br />
                <strong>Capacity:</strong> {station.total_capacity}
                <br />
                <small>
                  Last Updated:{" "}
                  {new Date(station.last_updated).toLocaleTimeString()}
                </small>
              </Popup>
            </Marker>
          ))}

        {toggles.Pedestrian &&
          pedestrianData.length > 0 &&
          pedestrianData.map((point, index) => (
            <Marker
              key={index}
              position={[point.latitude, point.longitude]}
              icon={getIconForCount(point.predicted_count)} // Use shared utility
            >
              <Popup>
                <div style={{ minWidth: "250px" }}>
                  <h3 style={{ marginTop: 0 }}>{point.location}</h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p>
                        <strong>Pedestrian Count:</strong>
                      </p>
                      <p
                        style={{
                          fontSize: "1.5em",
                          fontWeight: "bold",
                          color:
                            point.predicted_count > 200
                              ? "#e74c3c"
                              : point.predicted_count > 100
                              ? "#f39c12"
                              : "#2ecc71",
                        }}
                      >
                        {point.predicted_count}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Time:</strong> {point.formattedTime}
                      </p>
                      <p>
                        <strong>Date:</strong> {point.formattedDate}
                      </p>
                    </div>
                  </div>
                  <p>
                    <strong>Coordinates:</strong>
                  </p>
                  <p>
                    {point.latitude?.toFixed(5)},{" "}
                    {point.longitude?.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default HomeTab;
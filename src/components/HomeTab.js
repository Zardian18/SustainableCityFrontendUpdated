import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./HomeTab.css";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const HomeTab = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [sourcePosition, setSourcePosition] = useState(null);
  const [destinationPosition, setDestinationPosition] = useState(null);
  const [routes, setRoutes] = useState({
    normal: [],
    sustainable: [],
    clean: [],
  });
  const [loading, setLoading] = useState(false); // Add loading state

  // Fetch location suggestions from Nominatim API
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

  // Handle search for source or destination and fetch routes
  const handleSearch = async () => {
    setLoading(true); // Set loading to true when the request starts
    try {
      // Geocode source location
      if (source) {
        const sourceResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${source}&limit=1`
        );
        const sourceData = await sourceResponse.json();
        if (sourceData.length > 0) {
          const { lat, lon } = sourceData[0];
          setSourcePosition([parseFloat(lat), parseFloat(lon)]);
        }
      }

      // Geocode destination location
      if (destination) {
        const destResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${destination}&limit=1`
        );
        const destData = await destResponse.json();
        if (destData.length > 0) {
          const { lat, lon } = destData[0];
          setDestinationPosition([parseFloat(lat), parseFloat(lon)]);
        }
      }

      // Fetch routes from backend if both source and destination are set
      if (sourcePosition && destinationPosition) {
        const sourceCoords = { lat: sourcePosition[0], lon: sourcePosition[1] };
        const destCoords = { lat: destinationPosition[0], lon: destinationPosition[1] };
        const apiUrl = `http://localhost:5000/api/dashboard/?start_lat=${sourceCoords.lat}&start_lon=${sourceCoords.lon}&end_lat=${destCoords.lat}&end_lon=${destCoords.lon}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Update routes state with the fetched data
        setRoutes({
          normal: data.normal_route?.route || [],
          sustainable: data.sustainable_route?.route || [],
          clean: data.clean_route?.route || [],
        });
      }
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setLoading(false); // Set loading to false when the request completes
    }
  };

  // Handle input change for source
  const handleSourceChange = (e) => {
    const value = e.target.value;
    setSource(value);
    fetchSuggestions(value, setSourceSuggestions);
  };

  // Handle input change for destination
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    fetchSuggestions(value, setDestinationSuggestions);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion, setInput, setSuggestions, setPosition) => {
    setInput(suggestion.display_name);
    setSuggestions([]);
    setPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
  };

  return (
    <div className="map-container">
      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-inputs">
          {/* Source Input */}
          <div className="input-container">
            <input
              type="text"
              placeholder="Source Location"
              value={source}
              onChange={handleSourceChange}
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

          {/* Destination Input */}
          <div className="input-container">
            <input
              type="text"
              placeholder="Destination Location"
              value={destination}
              onChange={handleDestinationChange}
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

          {/* Search Icon */}
          <button onClick={handleSearch} className="search-button">
            🔍
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={[53.3498, -6.2603]} // Center on Dublin
        zoom={13}
        style={{ height: "calc(100vh - 64px)", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Source Marker */}
        {sourcePosition && (
          <Marker position={sourcePosition}>
            <Popup>Source: {source}</Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationPosition && (
          <Marker position={destinationPosition}>
            <Popup>Destination: {destination}</Popup>
          </Marker>
        )}

        {/* Normal Route (Blue) */}
        {routes.normal.length > 0 && (
          <Polyline positions={routes.normal} color="blue" weight={4}>
            <Popup>Normal Route</Popup>
          </Polyline>
        )}

        {/* Sustainable Route (Green) */}
        {routes.sustainable.length > 0 && (
          <Polyline positions={routes.sustainable} color="green" weight={4}>
            <Popup>Sustainable Route</Popup>
          </Polyline>
        )}

        {/* Clean Route (Purple) */}
        {routes.clean.length > 0 && (
          <Polyline positions={routes.clean} color="purple" weight={4}>
            <Popup>Clean Route</Popup>
          </Polyline>
        )}
      </MapContainer>
    </div>
  );
};

export default HomeTab;
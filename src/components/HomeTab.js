import React, { useState, useEffect } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import MapToggles from "./MapToggles";
import L from "leaflet";
import "./HomeTab.css";
import HeatmapLayer from "./HeatmapLayer"; // Import the HeatmapLayer component

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
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
	const [aqiData, setAqiData] = useState([]);
	const [busHeatmapData, setBusHeatmapData] = useState([]);
	const [eventsData, setEventsData] = useState([]);
	const [bikeData, setBikeData] = useState([]);
	const [pedestrianData, setPedestrianData] = useState([]);

	const [toggles, setToggles] = useState({
		AQI: false,
		Heatmap: false,
		bike_stand: false,
		Events: false,
		Pedestrian: false,
	});

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
				const destCoords = {
					lat: destinationPosition[0],
					lon: destinationPosition[1],
				};
				const apiUrl = `http://localhost:5000/api/dashboard/?start_lat=${sourceCoords.lat}&start_lon=${sourceCoords.lon}&end_lat=${destCoords.lat}&end_lon=${destCoords.lon}`;
				const response = await fetch(apiUrl);
				const data = await response.json();

				// Update routes state with the fetched data
				setRoutes({
					normal: data.normal_route?.route || [],
					sustainable: data.sustainable_route?.route || [],
					clean: data.clean_route?.route || [],
				});
				setAqiData(data.air_pollution?.data || []);
				setBusHeatmapData(data.bus_heatmap || []);
				setEventsData(data.events || []);
				setBikeData(data.bike_notifications?.notifications || []);
				setPedestrianData(data.pedestrian?.[0]?.data || []);
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
	const handleSuggestionClick = (
		suggestion,
		setInput,
		setSuggestions,
		setPosition
	) => {
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

			<MapToggles toggles={toggles} setToggles={setToggles} />

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
					<HeatmapLayer
						points={busHeatmapData}
						radius={20}
						blur={15}
						maxZoom={17}
					/>
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
								icon={L.divIcon({
									className: "event-marker",
									html: `<div class="event-pin">📍</div>`,
									iconSize: [24, 24],
									iconAnchor: [12, 24],
								})}
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
							icon={L.divIcon({
								className: "pedestrian-marker",
								html: `<div class="ped-icon">${point.predicted_count}</div>`,
								iconSize: [30, 30],
								iconAnchor: [15, 30],
							})}
						>
							<Popup>
								<strong>Location:</strong> {point.location}
								<br />
								<strong>Predicted Count:</strong> {point.predicted_count}
								<br />
								<small>{new Date(point.datetime).toLocaleString()}</small>
							</Popup>
						</Marker>
					))}
			</MapContainer>
		</div>
	);
};

export default HomeTab;

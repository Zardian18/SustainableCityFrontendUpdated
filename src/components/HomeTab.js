import React, { useState, useEffect, useCallback } from "react";
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
import HeatmapLayer from "./HeatmapLayer";
import { getIconForCount } from "../utils/markerIconForPedestrian";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const eventIcon2 = L.icon({
	iconUrl: "https://cdn-icons-png.flaticon.com/512/4285/4285436.png",
	iconSize: [32, 32],
	iconAnchor: [16, 32],
});

const bikeIcon = L.icon({
	iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
	iconSize: [32, 32],
	iconAnchor: [16, 32],
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
	const [sourceLoading, setSourceLoading] = useState(false); // Local loading for source suggestions
	const [destLoading, setDestLoading] = useState(false); // Local loading for destination suggestions
	const [suggestionsCache, setSuggestionsCache] = useState({}); // Cache for suggestions

	// Debounce function to limit API calls
	const debounce = (func, delay) => {
		let timeoutId;
		return (...args) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func(...args), delay);
		};
	};

	// Fetch suggestions with caching
	const fetchSuggestions = async (query, setSuggestions, setLocalLoading) => {
		if (query.length < 3) {
			setSuggestions([]);
			setLocalLoading(false);
			return;
		}

		// Check cache first
		if (suggestionsCache[query]) {
			setSuggestions(suggestionsCache[query]);
			setLocalLoading(false);
			return;
		}

		setLocalLoading(true);
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`
			);
			const data = await response.json();
			// Update cache
			setSuggestionsCache((prev) => ({ ...prev, [query]: data }));
			setSuggestions(data);
		} catch (error) {
			console.error("Error fetching suggestions:", error);
			setSuggestions([]);
		} finally {
			setLocalLoading(false);
		}
	};

	// Debounced version of fetchSuggestions
	const debouncedFetchSuggestions = useCallback(
		debounce((query, setSuggestions, setLocalLoading) => {
			fetchSuggestions(query, setSuggestions, setLocalLoading);
		}, 500), // 500ms delay
		[suggestionsCache]
	);

	// Function to fetch dashboard data (AQI, Heatmap, Events, Bike, Pedestrian)
	const fetchDashboardData = async (
		startLat = null,
		startLon = null,
		endLat = null,
		endLon = null
	) => {
		setLoading(true);
		try {
			// Construct the API URL with or without coordinates
			// let apiUrl = "http://localhost:5000/api/dashboard/full";
			let heatmap_url = "http://localhost:5000/api/dashboard/bus_heatmap";
			let events_url = "http://localhost:5000/api/dashboard/events";
			let bike_predictions_url =
				"http://localhost:5000/api/dashboard/bike_notifications";
			let aqi_url = "http://localhost:5000/api/dashboard/air_pollution";
			let pedestrian_url =
				"http://localhost:5000/api/dashboard/pedestrian";
			let normal_route_url =
				"http://localhost:5000/api/dashboard/normal_route";
			let sustainable_route_url =
				"http://localhost:5000/api/dashboard/sustainable_route";
			let clean_route_url =
				"http://localhost:5000/api/dashboard/clean_route";

			if (startLat && startLon && endLat && endLon) {
				normal_route_url += `?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}`;
				sustainable_route_url += `?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}`;
				clean_route_url += `?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}`;
			}

			const res_normal = await fetch(normal_route_url);
			const res_sustainable = await fetch(sustainable_route_url);
			const res_clean = await fetch(clean_route_url);
			const res_heatmap = await fetch(heatmap_url);
			const res_events = await fetch(events_url);
			const res_bike = await fetch(bike_predictions_url);
			const res_aqi = await fetch(aqi_url);
			const res_pedestrian = await fetch(pedestrian_url);

			const data1 = await res_normal.json();
			const data2 = await res_sustainable.json();
			const data3 = await res_clean.json();
			const data_heatmap = await res_heatmap.json();
			const data_events = await res_events.json();
			const data_bike = await res_bike.json();
			const data_aqi = await res_aqi.json();
			const data_pedestrian = await res_pedestrian.json();

			// Ensure route coordinates are in [lat, lon] array format
			const formatCoords = (route) =>
				(route || []).map((coord) =>
					Array.isArray(coord) ? coord : [coord.lat, coord.lon]
				);

			// Update routes only if coordinates were provided
			if (startLat && startLon && endLat && endLon) {
				setRoutes({
					normal: formatCoords(data1.normal_route?.route),
					sustainable: formatCoords(data2.sustainable_route?.route),
					clean: formatCoords(data3.clean_route?.route),
				});
			}

			// Update other data regardless of coordinates
			setAqiData(data_aqi.air_pollution?.data || []);
			setBusHeatmapData(data_heatmap.bus_heatmap || []);
			setEventsData(data_events.events || []);
			setBikeData(data_bike.bike_notifications?.notifications || []);

			// Format pedestrian data to include formattedTime and formattedDate
			const formattedPedestrianData = (
				data_pedestrian.pedestrian?.[0]?.data || []
			).map((item) => ({
				...item,
				formattedTime: new Date(item.datetime).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
				formattedDate: new Date(item.datetime).toLocaleDateString(),
			}));
			setPedestrianData(formattedPedestrianData);

			setSelectedRoute(null); // Show all on initial load
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		} finally {
			setLoading(false);
		}
	};

	// Fetch initial data when the component mounts
	useEffect(() => {
		fetchDashboardData(); // Fetch data without coordinates on mount
	}, []); // Empty dependency array ensures this runs only once on mount

	const handleSearch = async () => {
		let newSourcePos = null;
		let newDestPos = null;

		try {
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
				// Fetch dashboard data with coordinates to include routes
				await fetchDashboardData(
					newSourcePos[0],
					newSourcePos[1],
					newDestPos[0],
					newDestPos[1]
				);
			}
		} catch (error) {
			console.error("Error during search:", error);
		}
	};

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
			<div className="search-bar">
				<div className="search-inputs">
					<div className="input-container">
						<div className="input-wrapper">
							<input
								type="text"
								placeholder="Source Location"
								value={source}
								onChange={(e) => {
									const value = e.target.value;
									setSource(value);
									debouncedFetchSuggestions(
										value,
										setSourceSuggestions,
										setSourceLoading
									);
								}}
								className="location-input"
							/>
							{sourceLoading && (
								<div className="input-spinner"></div>
							)}
						</div>
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
						<div className="input-wrapper">
							<input
								type="text"
								placeholder="Destination Location"
								value={destination}
								onChange={(e) => {
									const value = e.target.value;
									setDestination(value);
									debouncedFetchSuggestions(
										value,
										setDestinationSuggestions,
										setDestLoading
									);
								}}
								className="location-input"
							/>
							{destLoading && (
								<div className="input-spinner"></div>
							)}
						</div>
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

					<button onClick={handleSearch} className="search-button">
						🔍
					</button>
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
				{routes.normal.length > 0 &&
					(selectedRoute === null || selectedRoute === "normal") && (
						<Polyline
							positions={routes.normal}
							color="blue"
							weight={5}
							opacity={1}
						>
							<Popup>Normal Route</Popup>
						</Polyline>
					)}

				{routes.sustainable.length > 0 &&
					(selectedRoute === null ||
						selectedRoute === "sustainable") && (
						<Polyline
							positions={routes.sustainable}
							color="green"
							weight={5}
							opacity={1}
						>
							<Popup>Sustainable Route</Popup>
						</Polyline>
					)}

				{routes.clean.length > 0 &&
					(selectedRoute === null || selectedRoute === "clean") && (
						<Polyline
							positions={routes.clean}
							color="purple"
							weight={5}
							opacity={1}
						>
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
								html: `<div class="aqi-circle">${point.aqi.toFixed(
									1
								)}</div>`,
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
								icon={eventIcon2}
							>
								<Popup>
									<strong>{event.name}</strong>
									<br />
									<em>{event.additionalType?.[0]}</em>
									<br />
									<small>
										<strong>Starts:</strong>{" "}
										{new Date(
											event.startDate
										).toLocaleString()}
									</small>
									<br />
									<small>
										<strong>Ends:</strong>{" "}
										{new Date(
											event.endDate
										).toLocaleString()}
									</small>
									<br />
									<br />
									{event.description?.substring(0, 150)}...
									<br />
									<a
										href={event.url}
										target="_blank"
										rel="noopener noreferrer"
									>
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
							position={[
								station.position.lat,
								station.position.lng,
							]}
							icon={bikeIcon}
						>
							<Popup>
								<strong>Station:</strong> {station.station_name}
								<br />
								<strong>Status:</strong> {station.status}
								<br />
								<strong>Current Bikes:</strong>{" "}
								{station.current_bikes}
								<br />
								<strong>Predicted Bikes:</strong>{" "}
								{station.predicted_bikes.toFixed(1)}
								<br />
								<strong>Capacity:</strong>{" "}
								{station.total_capacity}
								<br />
								<small>
									Last Updated:{" "}
									{new Date(
										station.last_updated
									).toLocaleTimeString()}
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
									<h3 style={{ marginTop: 0 }}>
										{point.location}
									</h3>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
										}}
									>
										<div>
											<p>
												<strong>
													Pedestrian Count:
												</strong>
											</p>
											<p
												style={{
													fontSize: "1.5em",
													fontWeight: "bold",
													color:
														point.predicted_count >
														200
															? "#e74c3c"
															: point.predicted_count >
															  100
															? "#f39c12"
															: "#2ecc71",
												}}
											>
												{point.predicted_count}
											</p>
										</div>
										<div>
											<p>
												<strong>Time:</strong>{" "}
												{point.formattedTime}
											</p>
											<p>
												<strong>Date:</strong>{" "}
												{point.formattedDate}
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

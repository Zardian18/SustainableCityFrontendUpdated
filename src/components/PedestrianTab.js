import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Typography, Button } from "@mui/material";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import "leaflet/dist/leaflet.css";
import { getIconForCount } from "../utils/markerIconForPedestrian";

const PedestrianTab = () => {
	const [pedestrianData, setPedestrianData] = useState([]);
	const [highPedestrianStreets, setHighPedestrianStreets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPedestrianData = async () => {
			try {
				// Check cache first
				const cachedData = getCachedData("pedestrianData");
				if (cachedData) {
					setPedestrianData(cachedData);
					setHighPedestrianStreets(
						cachedData.filter((loc) => loc.predicted_count > 200)
					);
					setLoading(false);
					return;
				}


				// const response = await axios.get("/api/dashboard/");
				const response = await axios.get(
					"http://localhost:5000/api/dashboard/"
				);

				const pedestrianResponse = response.data.pedestrian?.[0];

				// Validate API response structure
				if (
					!pedestrianResponse?.data ||
					!Array.isArray(pedestrianResponse.data)
				) {
					throw new Error("Invalid or missing pedestrian data.");
				}

				// Map & clean data
				const data = pedestrianResponse.data
					.filter(
						(item) =>
							item.latitude !== undefined &&
							item.longitude !== undefined
					) // Ensure coordinates exist
					.map((item) => ({
						...item,
						formattedTime: new Date(
							item.datetime
						).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						}),
						formattedDate: new Date(
							item.datetime
						).toLocaleDateString(),
					}));

				// Get only streets with pedestrian count > 200
				const highTrafficStreets = data.filter(
					(item) => item.predicted_count > 200
				);

				setPedestrianData(data);
				setHighPedestrianStreets(highTrafficStreets);
				setCachedData("pedestrianData", data);
				setError(null);
			} catch (error) {
				console.error("Error fetching pedestrian data:", error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchPedestrianData();
	}, []);

	if (loading)
		return <div className="loading">Loading pedestrian data...</div>;
	if (error) return <div className="error">Error: {error}</div>;

	return (
		<Box display="flex" height="90vh" padding="10px">
			{/* Left-side Scrollable Component */}
			<Box
				flex="3"
				padding="10px"
				overflow="auto"
				height="100%"
				bgcolor="#f7f7f7"
				borderRight="1px solid #ddd"
			>
				<Typography variant="h5" gutterBottom>
					High Pedestrian Streets
				</Typography>
				{highPedestrianStreets.length > 0 ? (
					highPedestrianStreets.map((location, index) => (
						<Box
							key={index}
							padding="10px"
							marginBottom="10px"
							bgcolor="white"
							boxShadow={2}
							borderRadius="5px"
						>
							<Typography variant="h6">
								{location.location}
							</Typography>
							<Typography variant="body1">
								Count: {location.predicted_count}
							</Typography>
							<Button
								variant="contained"
								color="primary" // Match navbar color
								fullWidth
								sx={{
									marginTop: "10px",
									color: "white",
								}}
							>
								Request Garda
							</Button>
						</Box>
					))
				) : (
					<Typography>No high pedestrian streets found.</Typography>
				)}
			</Box>

			{/* Right-side Map */}
			<Box flex="7" height="100%">
				<MapContainer
					center={[53.3498, -6.2603]} // Dublin center
					zoom={14}
					style={{ height: "100%", width: "100%" }}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution="&copy; OpenStreetMap contributors"
					/>

					{pedestrianData.map((location, index) => (
						<Marker
							key={index}
							position={[location.latitude, location.longitude]}
							icon={getIconForCount(location.predicted_count)}
						>
							<Popup>
								<div style={{ minWidth: "250px" }}>
									<h3 style={{ marginTop: 0 }}>
										{location.location}
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
														location.predicted_count >
														200
															? "#e74c3c"
															: location.predicted_count >
															  100
															? "#f39c12"
															: "#2ecc71",
												}}
											>
												{location.predicted_count}
											</p>
										</div>
										<div>
											<p>
												<strong>Time:</strong>{" "}
												{location.formattedTime}
											</p>
											<p>
												<strong>Date:</strong>{" "}
												{location.formattedDate}
											</p>
										</div>
									</div>
									<p>
										<strong>Coordinates:</strong>
									</p>
									<p>
										{location.latitude?.toFixed(5)},{" "}
										{location.longitude?.toFixed(5)}
									</p>
								</div>
							</Popup>
						</Marker>
					))}
				</MapContainer>
			</Box>
		</Box>
	);
};

export default PedestrianTab;

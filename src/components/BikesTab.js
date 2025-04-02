import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Typography, Button, Grid } from "@mui/material";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
	iconUrl: require("leaflet/dist/images/marker-icon.png"),
	shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom bike icon
const bikeIcon = L.icon({
	iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
	iconSize: [32, 32],
	iconAnchor: [16, 32],
});

const BikesTab = () => {
	const [bikeStations, setBikeStations] = useState([]);
	const [highDemandStations, setHighDemandStations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchBikeData = async () => {
			try {
				// Check cache first
				const cachedData = getCachedData("bikePredictions");
				if (cachedData) {
					setBikeStations(cachedData);
					setHighDemandStations(
						cachedData.filter(
							(station) =>
								(station.predicted_bikes -
									station.current_bikes) /
									station.total_capacity >
								0.5
						)
					);
					setLoading(false);
					return;
				}

				// Fetch fresh data

				const response = await axios.get(
					"http://localhost:5000/api/dashboard/"
				);
				const bikeNotifications =
					response.data.bike_notifications?.notifications || [];
				const bikePredictions = response.data.predictions?.data || [];

				if (!bikeNotifications.length || !bikePredictions.length) {
					throw new Error("No bike data found.");
				}

				// Merge notifications & predictions
				const stations = bikeNotifications.map((station) => {
					const predictedData = bikePredictions.find(
						(pred) =>
							pred.latitude === station.position.lat &&
							pred.longitude === station.position.lng
					);

					return {
						id: station.station_id,
						name: station.station_name,
						position: [station.position.lat, station.position.lng],
						current_bikes: station.current_bikes,
						predicted_bikes:
							predictedData?.predictions?.[0]?.bikes || 0,
						total_capacity: station.total_capacity,
						demandRatio:
							(station.predicted_bikes - station.current_bikes) /
							station.total_capacity,
						weeklyPredictions: predictedData?.predictions || [],
					};
				});

				// Get high-demand stations
				const highDemand = stations.filter(
					(station) => station.demandRatio > 0.5
				);

				setBikeStations(stations);
				setHighDemandStations(highDemand);
				setCachedData("bikePredictions", stations);
				setError(null);
			} catch (error) {
				console.error("Error fetching bike data:", error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchBikeData();
	}, []);

	if (loading)
		return <div className="loading">Loading bike station data...</div>;
	if (error) return <div className="error">Error: {error}</div>;

	return (
		<Box display="flex" height="90vh" padding="10px">
			{/* Left-side Segment for High Demand Stations */}
			<Box
				flex="3"
				padding="10px"
				overflow="auto"
				height="100%"
				bgcolor="#f7f7f7"
				borderRight="1px solid #ddd"
			>
				<Typography variant="h5" gutterBottom>
					High Demand Stations
				</Typography>
				{highDemandStations.length > 0 ? (
					highDemandStations.map((station) => (
						<Box
							key={station.id}
							padding="10px"
							marginBottom="10px"
							bgcolor="white"
							boxShadow={2}
							borderRadius="5px"
						>
							<Typography variant="h6">{station.name}</Typography>
							<Typography variant="body1">
								Current Bikes: {station.current_bikes}
							</Typography>
							<Typography variant="body1">
								Predicted Bikes: {station.predicted_bikes}
							</Typography>
							<Button
								variant="contained"
								color="primary"
								fullWidth
								sx={{ marginTop: "10px", color: "white" }}
							>
								Request More Bikes
							</Button>
						</Box>
					))
				) : (
					<Typography>No high-demand stations found.</Typography>
				)}
			</Box>

			{/* Right-side Map */}
			<Box flex="7" height="100%" overflow="auto">
				<MapContainer
					center={[53.3498, -6.2603]} // Dublin center
					zoom={14}
					style={{ height: "70%", width: "100%" }}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution="&copy; OpenStreetMap contributors"
					/>

					{bikeStations.map((station) => (
						<Marker
							key={station.id}
							position={station.position}
							icon={bikeIcon}
						>
							<Popup>
								<div style={{ minWidth: "250px" }}>
									<h3 style={{ marginTop: 0 }}>
										{station.name}
									</h3>
									<p>
										<strong>Current Bikes:</strong>{" "}
										{station.current_bikes}
									</p>
									<p>
										<strong>Predicted Bikes:</strong>{" "}
										{station.predicted_bikes}
									</p>
									<p>
										<strong>Capacity:</strong>{" "}
										{station.total_capacity}
									</p>
									<p>
										<strong>Demand Ratio:</strong>{" "}
										{(station.demandRatio * 100).toFixed(1)}
										%
									</p>
								</div>
							</Popup>
						</Marker>
					))}
				</MapContainer>

				{/* Scrollable Weekly Predictions */}
				<Box
					marginTop="20px"
					height="300px"
					overflow="auto"
					padding="10px"
					bgcolor="#f9f9f9"
					borderRadius="5px"
					boxShadow={2}
				>
					<Typography variant="h6" gutterBottom>
						Weekly Predictions
					</Typography>
					<Grid container spacing={2}>
						{bikeStations.map((station) =>
							station.weeklyPredictions.length > 0 ? (
								<Grid item xs={12} sm={6} key={station.id}>
									<Box
										padding="10px"
										bgcolor="white"
										boxShadow={1}
										borderRadius="5px"
									>
										<Typography variant="h6">
											{station.name}
										</Typography>
										<table
											style={{
												width: "100%",
												borderCollapse: "collapse",
											}}
										>
											<thead>
												<tr
													style={{
														backgroundColor:
															"#f5f5f5",
													}}
												>
													<th
														style={{
															padding: "8px",
															textAlign: "left",
														}}
													>
														Date
													</th>
													<th
														style={{
															padding: "8px",
															textAlign: "right",
														}}
													>
														Bikes
													</th>
													<th
														style={{
															padding: "8px",
															textAlign: "right",
														}}
													>
														Stands
													</th>
												</tr>
											</thead>
											<tbody>
												{station.weeklyPredictions.map(
													(pred, idx) => {
														// If bikes > stands, assign bikes = stands
														const bikes = Math.min(
															pred.bikes,
															pred.stands
														);
														return (
															<tr key={idx}>
																<td
																	style={{
																		padding:
																			"8px",
																	}}
																>
																	{new Date(
																		pred.date
																	).toLocaleDateString()}
																</td>
																<td
																	style={{
																		padding:
																			"8px",
																		textAlign:
																			"right",
																	}}
																>
																	{Math.round(
																		bikes
																	)}
																</td>
																<td
																	style={{
																		padding:
																			"8px",
																		textAlign:
																			"right",
																	}}
																>
																	{Math.round(
																		pred.stands
																	)}
																</td>
															</tr>
														);
													}
												)}
											</tbody>
										</table>
									</Box>
								</Grid>
							) : null
						)}
					</Grid>
				</Box>
			</Box>
		</Box>
	);
};

export default BikesTab;

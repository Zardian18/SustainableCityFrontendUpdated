import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Typography, Button, Grid } from "@mui/material";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import "leaflet/dist/leaflet.css";
import useAuthStore from "../store/useAuthStore";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

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
  const { user } = useAuthStore();
  const { username, role } = user || {};

  useEffect(() => {
    const fetchBikeData = async () => {
      try {
        const cachedData = getCachedData("bikePredictions");
        if (cachedData) {
          setBikeStations(cachedData);
          setHighDemandStations(cachedData.filter((station) => station.demandRatio > 0.1));
          setLoading(false);
          return;
        }

        const response1 = await axios.get("http://localhost:5000/api/dashboard/bike_notifications");
        const bikeNotifications = response1.data.bike_notifications?.notifications || [];

        const response2 = await axios.get("http://localhost:5000/api/dashboard/predictions");
        const bikePredictions = response2.data.predictions?.data || [];

        if (!bikeNotifications.length || !bikePredictions.length) {
          throw new Error("No bike data found.");
        }

        const stations = bikeNotifications.map((station) => {
          const predictedData = bikePredictions.find(
            (pred) =>
              pred.latitude === station.position.lat &&
              pred.longitude === station.position.lng
          );

          let initialPredictedBikes = predictedData?.predictions?.[0]?.bikes || 0;
          if (initialPredictedBikes === 0) {
            const randomAdjustment = Math.floor(Math.random() * 14) - 3;
            initialPredictedBikes = Math.min(
              station.current_bikes + randomAdjustment,
              station.total_capacity
            );
          }

          const demandRatio =
            (initialPredictedBikes - station.current_bikes) / station.total_capacity;

          return {
            id: station.station_id,
            name: station.station_name,
            position: [station.position.lat, station.position.lng],
            current_bikes: station.current_bikes,
            predicted_bikes: initialPredictedBikes,
            total_capacity: station.total_capacity,
            demandRatio: demandRatio,
            weeklyPredictions: predictedData?.predictions || [],
          };
        });

        const highDemand = stations.filter((station) => station.demandRatio > 0.1);

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

  const handleRerouteRequest = async (bikeId, startPosition, stationName) => {
    try {
      const endPosition = [53.3498, -6.2603]; // Placeholder - adjust as needed

      const rerouteData = {
        bike_id: bikeId,
        start: { lat: startPosition[0], lng: startPosition[1] },
        end: { lat: endPosition[0], lng: endPosition[1] },
        manager_name: username,
        mode_of_transport: "bike",
        station_name: stationName,  // Include station name
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
      alert(
        `Reroute request for Bike Station ${bikeId} (${stationName}) sent successfully!\nStatus: ${notification.status}\nTimestamp: ${notification.timestamp}`
      );
    } catch (err) {
      console.error("Error sending reroute request:", err);
      const errorMessage = err.response?.data?.error || "Network error - ensure backend is running";
      alert(`Failed to send reroute request: ${errorMessage}`);
    }
  };

  if (loading) return <div className="loading">Loading bike station data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <Box display="flex" height="90vh" padding="10px">
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
              <Typography variant="body1">Current Bikes: {station.current_bikes}</Typography>
              <Typography variant="body1">
                Predicted Bikes: {station.predicted_bikes}
              </Typography>
              {role === "manager" && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: "10px", color: "white" }}
                  onClick={() => handleRerouteRequest(station.id, station.position, station.name)}  // Pass station.name
                >
                  Request More Bikes
                </Button>
              )}
            </Box>
          ))
        ) : (
          <Typography>No high-demand stations found.</Typography>
        )}
      </Box>

      <Box flex="7" height="100%" overflow="auto">
        <MapContainer
          center={[53.3498, -6.2603]}
          zoom={14}
          style={{ height: "70%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {bikeStations.map((station) => (
            <Marker key={station.id} position={station.position} icon={bikeIcon}>
              <Popup>
                {(() => {
                  let adjustedPrediction = station.predicted_bikes;
                  if (adjustedPrediction === 0) {
                    const randomAdjustment = Math.floor(Math.random() * 14) - 3;
                    adjustedPrediction = Math.min(
                      station.current_bikes + randomAdjustment,
                      station.total_capacity
                    );
                  }

                  const newDemandRatio =
                    (adjustedPrediction - station.current_bikes) / station.total_capacity;

                  return (
                    <div style={{ minWidth: "250px" }}>
                      <h3 style={{ marginTop: 0 }}>{station.name}</h3>
                      <p>
                        <strong>Current Bikes:</strong> {station.current_bikes}
                      </p>
                      <p>
                        <strong>Predicted Bikes:</strong> {adjustedPrediction}
                      </p>
                      <p>
                        <strong>Capacity:</strong> {station.total_capacity}
                      </p>
                      <p>
                        <strong>Demand Ratio:</strong> {(newDemandRatio * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                })()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

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
                  <Box padding="10px" bgcolor="white" boxShadow={1} borderRadius="5px">
                    <Typography variant="h6">{station.name}</Typography>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                          <th style={{ padding: "8px", textAlign: "left" }}>Date</th>
                          <th style={{ padding: "8px", textAlign: "right" }}>Bikes</th>
                          <th style={{ padding: "8px", textAlign: "right" }}>Stands</th>
                        </tr>
                      </thead>
                      <tbody>
                        {station.weeklyPredictions.map((pred, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: "8px" }}>
                              {new Date(pred.date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "8px", textAlign: "right" }}>
                              {Math.round(pred.bikes)}
                            </td>
                            <td style={{ padding: "8px", textAlign: "right" }}>
                              {Math.round(pred.stands)}
                            </td>
                          </tr>
                        ))}
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
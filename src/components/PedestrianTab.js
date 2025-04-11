import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Typography, Button } from "@mui/material";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import "leaflet/dist/leaflet.css";
import { getIconForCount } from "../utils/markerIconForPedestrian";
import useAuthStore from "../store/useAuthStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PedestrianTab = () => {
  const [pedestrianData, setPedestrianData] = useState([]);
  const [highPedestrianStreets, setHighPedestrianStreets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const { username, role } = user || {};

  useEffect(() => {
    const fetchPedestrianData = async () => {
      try {
        const cachedData = getCachedData("pedestrianData");
        if (cachedData) {
          setPedestrianData(cachedData);
          setHighPedestrianStreets(cachedData.filter((loc) => loc.predicted_count > 2000));
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/dashboard/pedestrian");
        const pedestrianResponse = response.data.pedestrian?.[0];

        if (!pedestrianResponse?.data || !Array.isArray(pedestrianResponse.data)) {
          throw new Error("Invalid or missing pedestrian data.");
        }

        const data = pedestrianResponse.data
          .filter((item) => item.latitude !== undefined && item.longitude !== undefined)
          .map((item) => ({
            ...item,
            formattedTime: new Date(item.datetime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            formattedDate: new Date(item.datetime).toLocaleDateString(),
          }));

        const highTrafficStreets = data.filter((item) => item.predicted_count > 2000);

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

  const handleRerouteRequest = async (streetName, position) => {
    try {
      const endPosition = [53.3498, -6.2603]; // Placeholder - adjust as needed (e.g., Garda station)

      const rerouteData = {
        start: { lat: position[0], lng: position[1] },
        end: { lat: endPosition[0], lng: endPosition[1] },
        manager_name: username,
        mode_of_transport: "pedestrian",
        event_name: streetName,
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
      // Use toast with the same message as the original alert
      toast.success(
        `Garda request for street ${streetName} sent successfully!\nStatus: ${notification.status}\nTimestamp: ${notification.timestamp}`,
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
      // Use toast with the same error message as the original alert
      toast.error(`Failed to send Garda request: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  if (loading) return <div className="loading">Loading pedestrian data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <Box display="flex" height="90vh" padding="10px">
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
              <Typography variant="h6">{location.location}</Typography>
              <Typography variant="body1">Count: {location.predicted_count}</Typography>
              {role === "manager" && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: "10px", color: "white" }}
                  onClick={() => handleRerouteRequest(location.location, [location.latitude, location.longitude])}
                >
                  Request Garda
                </Button>
              )}
            </Box>
          ))
        ) : (
          <Typography>No high pedestrian streets found.</Typography>
        )}
      </Box>

      <Box flex="7" height="100%">
        <MapContainer
          center={[53.3498, -6.2603]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {pedestrianData.map((location, index) => (
            <Marker
              key={index}
              position={[location.latitude, location.longitude]}
              icon={getIconForCount(location.predicted_count)}
            >
              <Popup>
                <div style={{ minWidth: "250px" }}>
                  <h3 style={{ marginTop: 0 }}>{location.location}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <p>
                        <strong>Pedestrian Count:</strong>
                      </p>
                      <p
                        style={{
                          fontSize: "1.5em",
                          fontWeight: "bold",
                          color:
                            location.predicted_count > 2000
                              ? "#e74c3c"
                              : location.predicted_count > 500
                              ? "#f39c12"
                              : "#2ecc71",
                        }}
                      >
                        {location.predicted_count}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Time:</strong> {location.formattedTime}
                      </p>
                      <p>
                        <strong>Date:</strong> {location.formattedDate}
                      </p>
                    </div>
                  </div>
                  <p>
                    <strong>Coordinates:</strong>
                  </p>
                  <p>
                    {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
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
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Typography, Button } from "@mui/material";
import L from "leaflet";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/cache";
import "leaflet/dist/leaflet.css";
import useAuthStore from "../store/useAuthStore";
// Import react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom event icon
const eventIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4285/4285436.png",
  iconSize: [24, 24],
  iconAnchor: [16, 32],
});

const EventsTab = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const { username, role } = user || {};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const cachedData = getCachedData("eventsData");
        if (cachedData) {
          setEvents(cachedData);
          setUpcomingEvents(getUpcomingEvents(cachedData));
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/dashboard/events");

        if (!response.data.events) {
          throw new Error("No event data found");
        }

        const processedEvents = response.data.events
          .filter((event) => event.location?.geo)
          .map((event) => ({
            id: event["@id"],
            name: event.name || "Unnamed Event",
            description: event.description || "No description available",
            startDate: event.startDate,
            endDate: event.endDate,
            position: [event.location.geo.latitude, event.location.geo.longitude],
            schedule: event.eventSchedule || [],
            type: event.additionalType?.[0] || "Event",
          }));

        setEvents(processedEvents);
        setUpcomingEvents(getUpcomingEvents(processedEvents));
        setCachedData("eventsData", processedEvents);
        setError(null);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getUpcomingEvents = (events) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate >= today && eventDate <= nextWeek;
    });
  };

  const handleRerouteRequest = async (eventId, eventPosition, eventName) => {
    try {
      const endPosition = [53.3498, -6.2603]; // Placeholder - adjust as needed (e.g., Garda station)

      const rerouteData = {
        start: { lat: eventPosition[0], lng: eventPosition[1] },
        end: { lat: endPosition[0], lng: endPosition[1] },
        manager_name: username,
        mode_of_transport: "pedestrian",
        event_name: eventName,
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
        `Garda request for Event (${eventName}) sent successfully!\nStatus: ${notification.status}\nTimestamp: ${notification.timestamp}`,
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

  if (loading) return <div className="loading">Loading events...</div>;
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
          Upcoming Events This Week
        </Typography>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event, index) => (
            <Box
              key={index}
              padding="10px"
              marginBottom="10px"
              bgcolor="white"
              boxShadow={2}
              borderRadius="5px"
            >
              <Typography variant="h6">{event.name}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {event.type}
              </Typography>
              <Typography variant="body1">
                <strong>When:</strong> {new Date(event.startDate).toLocaleDateString()} -{" "}
                {new Date(event.endDate).toLocaleDateString()}
              </Typography>
              {event.schedule.length > 0 && (
                <Typography variant="body2">
                  <strong>Schedule:</strong> {event.schedule[0].startTime} -{" "}
                  {event.schedule[0].endTime}
                </Typography>
              )}
              {role === "manager" && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: "10px", color: "white" }}
                  onClick={() => handleRerouteRequest(event.id, event.position, event.name)}
                >
                  Request Garda
                </Button>
              )}
            </Box>
          ))
        ) : (
          <Typography>No upcoming events this week.</Typography>
        )}
      </Box>

      <Box flex="7" height="100%">
        <MapContainer
          center={[53.3498, -6.2603]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {events.map((event) => (
            <Marker key={event.id} position={event.position} icon={eventIcon}>
              <Popup>
                <div style={{ minWidth: "250px", maxWidth: "300px" }}>
                  <h3 style={{ marginTop: 0, color: "#2c3e50" }}>{event.name}</h3>
                  <p>
                    <strong>Type:</strong> {event.type}
                  </p>
                  <p>
                    <strong>Dates:</strong> {new Date(event.startDate).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                  <div style={{ margin: "10px 0" }}>
                    <p style={{ marginBottom: "5px" }}>
                      <strong>Schedule:</strong>
                    </p>
                    {event.schedule.length > 0 ? (
                      <ul style={{ paddingLeft: "20px", margin: 0 }}>
                        {event.schedule.map((session, idx) => (
                          <li key={idx}>
                            {new Date(session.startDate).toLocaleDateString()}:{" "}
                            {session.startTime} - {session.endTime}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No schedule available</p>
                    )}
                  </div>
                  <details>
                    <summary style={{ cursor: "pointer", color: "#3498db" }}>
                      More Details
                    </summary>
                    <p style={{ marginTop: "10px" }}>{event.description}</p>
                  </details>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default EventsTab;
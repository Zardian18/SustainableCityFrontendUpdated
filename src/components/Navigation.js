import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Badge,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Cookies from "js-cookie";
import useAuthStore from "../store/useAuthStore";
import axios from "axios";

const Navigation = ({ activeTab, setActiveTab }) => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false); // Track if there are unread notifications
  const { user, clearUser } = useAuthStore();
  const { username, role, mode } = user || {}; // Fallback to avoid undefined errors

  const handleMenuOpen = (event) => setAnchorElUser(event.currentTarget);
  const handleMenuClose = () => setAnchorElUser(null);
  const handleNotifOpen = (event) => {
    setAnchorElNotif(event.currentTarget);
    // Mark all notifications as read when the menu is opened
    setHasUnreadNotifications(false);
    // Optionally, you can store the "read" state in localStorage or backend
  };
  const handleNotifClose = () => setAnchorElNotif(null);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("username");
    Cookies.remove("role");
    Cookies.remove("mode");
    clearUser();
    window.location.href = "/auth";
  };

  const fetchNotifications = async () => {
    try {
      // Add status parameter for users to fetch only approved notifications
      const params = role === "user" ? { status: "approved" } : {};
      const response = await axios.get("http://localhost:5000/api/notification/fetch-notification", { params });
      const allNotifications = response.data.notifications || [];

      // Debug: Log the API response and user data to ensure we're getting the right data
      console.log("All Notifications:", allNotifications);
      console.log("User Role:", role, "Mode:", mode);

      let filteredNotifications = [];
      if (role === "supervisor") {
        // Supervisors see notifications matching their mode
        filteredNotifications = allNotifications.filter(
          (notif) => notif.mode_of_transport === mode
        );
      } else if (role === "manager") {
        // Managers see their own notifications
        filteredNotifications = allNotifications.filter(
          (notif) => notif.manager_name === username
        );
      } else if (role === "user") {
        // Users see all approved notifications (removed mode filter to ensure visibility)
        filteredNotifications = allNotifications.filter(
          (notif) => notif.status === "approved"
        );
      }

      // Debug: Log the filtered notifications to ensure the filter is working
      console.log("Filtered Notifications:", filteredNotifications);

      // Calculate unread notifications
      const prevNotificationIds = notifications.map((notif) => notif.notification_id);
      const newNotifications = filteredNotifications.filter(
        (notif) => !prevNotificationIds.includes(notif.notification_id)
      );

      // Update the unread notifications flag (only if the menu is not open)
      if (!anchorElNotif && newNotifications.length > 0) {
        setHasUnreadNotifications(true);
      }

      setNotifications(filteredNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    // Ensure we only fetch notifications if the necessary user data is available
    if ((role === "supervisor" && mode) || (role === "manager" && username) || role === "user") {
      fetchNotifications(); // Initial fetch
      const interval = setInterval(fetchNotifications, 5000); // Fetch every 5 seconds
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [role, username, mode, anchorElNotif]);

  const handleNotificationAction = async (notificationId, newStatus) => {
    try {
      await axios.post("http://localhost:5000/api/notification/update-notification", {
        notification_id: notificationId,
        status: newStatus,
      });
      // Update local state to reflect change immediately
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notificationId ? { ...notif, status: newStatus } : notif
        )
      );
    } catch (err) {
      console.error("Error updating notification:", err);
      alert("Failed to update notification status");
    }
  };

  const getNotificationMessage = (notif) => {
    const showStatus = role !== "user"; // Don't show status for users
    switch (notif.mode_of_transport) {
      case "bus":
        return showStatus
          ? `Bus ${notif.bus_id} reroute request - ${notif.status}`
          : `Bus ${notif.bus_id} reroute request`;
      case "bike":
        return showStatus
          ? `Bike reroute request for ${notif.station_name || 'Station ' + notif.bike_id} - ${notif.status}`
          : `Bike reroute request for ${notif.station_name || 'Station ' + notif.bike_id}`;
      case "pedestrian":
        return showStatus
          ? notif.event_name
            ? `Garda request sent - ${notif.status}`
            : `Garda request sent - ${notif.status}`
          : notif.event_name
            ? `Garda request sent`
            : `Garda request sent`;
      default:
        return showStatus
          ? `Unknown mode reroute request - ${notif.status}`
          : `Unknown mode reroute request`;
    }
  };

  const getNotificationMessageUser = (notif) => {
    // Custom messages for users (role: "user")
    switch (notif.mode_of_transport) {
      case "bus":
        return `Bus ${notif.bus_id} has been rerouted`;
      case "bike":
        return `Bike ${notif.station_name || 'Station ' + notif.bike_id} has been rerouted`;
      case "pedestrian":
        return notif.event_name
          ? `Garda request for ${notif.event_name} has been approved`
          : `Garda request has been approved`;
      default:
        return `Reroute request has been approved`;
    }
  };

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <div>
          <Button
            color="inherit"
            onClick={() => setActiveTab("home")}
            sx={{ fontWeight: activeTab === "home" ? "bold" : "normal" }}
          >
            Home
          </Button>
          {role !== "user" && (
            <Button
              color="inherit"
              onClick={() => setActiveTab("weather")}
              sx={{ fontWeight: activeTab === "weather" ? "bold" : "normal" }}
            >
              Air Quality
            </Button>
          )}
          {((mode === "bus" && role === "supervisor") || role === "manager") && (
            <Button
              color="inherit"
              onClick={() => setActiveTab("bus")}
              sx={{ fontWeight: activeTab === "bus" ? "bold" : "normal" }}
            >
              Bus
            </Button>
          )}
          {((mode === "bike" && role === "supervisor") || role === "manager") && (
            <Button
              color="inherit"
              onClick={() => setActiveTab("bikes")}
              sx={{ fontWeight: activeTab === "bikes" ? "bold" : "normal" }}
            >
              Bike Stations
            </Button>
          )}
          {((mode === "pedestrian" && role === "supervisor") || role === "manager") && (
            <>
              <Button
                color="inherit"
                onClick={() => setActiveTab("events")}
                sx={{ fontWeight: activeTab === "events" ? "bold" : "normal" }}
              >
                Events
              </Button>
              <Button
                color="inherit"
                onClick={() => setActiveTab("pedestrian")}
                sx={{ fontWeight: activeTab === "pedestrian" ? "bold" : "normal" }}
              >
                Pedestrian
              </Button>
            </>
          )}
        </div>

        {username && (
          <div>
            {/* Notification Bell Icon for All Roles */}
            <IconButton color="inherit" onClick={handleNotifOpen}>
              <Badge
                variant="dot" // Use dot variant to show only a red dot
                color="error"
                invisible={!hasUnreadNotifications} // Show dot only if there are unread notifications
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleNotifClose}
              PaperProps={{ style: { maxHeight: 400, width: 400 } }}
            >
              {notifications.length === 0 ? (
                <MenuItem disabled>No notifications</MenuItem>
              ) : (
                notifications.map((notif) => (
                  <MenuItem
                    key={notif.notification_id}
                    disabled={notif.status !== "pending" || role !== "supervisor"} // Disable for non-supervisors or non-pending
                  >
                    <Box sx={{ width: "100%" }}>
                      <Typography variant="body2">
                        {role !== "user" ? getNotificationMessage(notif) : getNotificationMessageUser(notif)}
                      </Typography>
                      {role === "supervisor" && notif.status === "pending" && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() =>
                              handleNotificationAction(notif.notification_id, "approved")
                            }
                            sx={{ mr: 1 }}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() =>
                              handleNotificationAction(notif.notification_id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Menu>

            {/* User Profile Menu */}
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="subtitle2">{username}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="subtitle2">{role}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
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
  const { user, clearUser } = useAuthStore();
  const { username, role, mode } = user || {}; // Fallback to avoid undefined errors

  const handleMenuOpen = (event) => setAnchorElUser(event.currentTarget);
  const handleMenuClose = () => setAnchorElUser(null);
  const handleNotifOpen = (event) => setAnchorElNotif(event.currentTarget);
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
      const response = await axios.get("http://localhost:5000/api/notification/fetch-notification");
      const allNotifications = response.data.notifications || [];

      if (role === "supervisor") {
        // Supervisors see notifications matching their mode
        const filteredNotifications = allNotifications.filter(
          (notif) => notif.mode_of_transport === mode
        );
        setNotifications(filteredNotifications);
      } else if (role === "manager") {
        // Managers see their own notifications
        const managerNotifications = allNotifications.filter(
          (notif) => notif.manager_name === username
        );
        setNotifications(managerNotifications);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if ((role === "supervisor" && mode) || (role === "manager" && username)) {
      fetchNotifications(); // Initial fetch
      const interval = setInterval(fetchNotifications, 5000); // Fetch every 5 seconds
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [role, username, mode]);

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
    switch (notif.mode_of_transport) {
      case "bus":
        return `Bus ${notif.bus_id} reroute request - ${notif.status}`;
      case "bike":
        return `Bike reroute request for ${notif.station_name || 'Station ' + notif.bike_id} - ${notif.status}`;
      case "pedestrian":
        return notif.event_name
          ? `Garda request sent` 
          : `Garda request sent`;
      default:
        return `Unknown mode reroute request - ${notif.status}`;
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
            {(role === "supervisor" || role === "manager") && (
              <>
                <IconButton color="inherit" onClick={handleNotifOpen}>
                  <NotificationsIcon />
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
                        disabled={notif.status !== "pending" || role !== "supervisor"} // Disable for managers or non-pending
                      >
                        <Box sx={{ width: "100%" }}>
                          <Typography variant="body2">
                            {getNotificationMessage(notif)}
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
              </>
            )}
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
import React, { useState } from "react";
import Navigation from "./components/Navigation";
import HomeTab from "./components/HomeTab";
import WeatherTab from "./components/WeatherTab";
import BusTab from "./components/BusTab";
import BikesTab from "./components/BikesTab";
import EventsTab from "./components/EventsTab";
import PedestrianTab from "./components/PedestrianTab";
import { Box, Button } from "@mui/material";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  // State for HomeTab
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
  const [loading, setLoading] = useState(false);
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

  const clearCache = () => {
    localStorage.clear();
    window.location.reload(); // Optional: reload to see changes
    console.log("LocalStorage cache cleared");
  };

  return (
    <div className="App">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <Box sx={{ marginTop: "64px" }}>
        {activeTab === "home" && (
          <HomeTab
            source={source}
            setSource={setSource}
            destination={destination}
            setDestination={setDestination}
            sourceSuggestions={sourceSuggestions}
            setSourceSuggestions={setSourceSuggestions}
            destinationSuggestions={destinationSuggestions}
            setDestinationSuggestions={setDestinationSuggestions}
            sourcePosition={sourcePosition}
            setSourcePosition={setSourcePosition}
            destinationPosition={destinationPosition}
            setDestinationPosition={setDestinationPosition}
            routes={routes}
            setRoutes={setRoutes}
            loading={loading}
            setLoading={setLoading}
            aqiData={aqiData}
            setAqiData={setAqiData}
            busHeatmapData={busHeatmapData}
            setBusHeatmapData={setBusHeatmapData}
            eventsData={eventsData}
            setEventsData={setEventsData}
            bikeData={bikeData}
            setBikeData={setBikeData}
            pedestrianData={pedestrianData}
            setPedestrianData={setPedestrianData}
            toggles={toggles}
            setToggles={setToggles}
          />
        )}
        {activeTab === "weather" && <WeatherTab />}
        {activeTab === "bus" && <BusTab />}
        {activeTab === "bikes" && <BikesTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "pedestrian" && <PedestrianTab />}
      </Box>

      <Button
        color="warning"
        variant="outlined"
        onClick={clearCache}
        sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
      >
        Clear Cache
      </Button>
    </div>
  );
}

export default App;
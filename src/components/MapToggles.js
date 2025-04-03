import React from "react";
import "./MapToggles.css";

const MapToggles = ({ toggles, setToggles }) => {
  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="toggle-panel">
      {Object.keys(toggles).map((key) => (
        <div className="toggle-item" key={key}>
          <label>
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles[key]}
                onChange={() => handleToggle(key)}
              />
              <span className="slider round"></span>
            </label>
          </label>
        </div>
      ))}
    </div>
  );
};

export default MapToggles;

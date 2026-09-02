// src/pages/Routes.jsx
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCity } from "../context/CityContext";
import { useOptimizeRoute } from "../hooks/useRoutes";
import { FiMapPin, FiNavigation, FiSliders, FiClock, FiMap, FiWind } from "react-icons/fi";
import TrafficMap from "../components/Dashboard/TrafficMap";
import RouteOptimizer from "../components/Dashboard/RouteOptimizer";
import "./Routes.css";

const Routes = () => {
  const { currentCity } = useCity();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [preference, setPreference] = useState("balanced");
  const [routeData, setRouteData] = useState(null); // shared state between form and map

  const optimizeRoute = useOptimizeRoute();

  const handleRouteCalculated = useCallback((route) => {
    console.log("Route calculated:", route);
    setRouteData(route);
    toast.success("Route displayed on map!", { icon: "🗺️" });
  }, []);

  const handleOptimize = async (e) => {
    e.preventDefault();

    if (!origin || !destination) {
      toast.error("Please enter origin and destination");
      return;
    }

    // Use city center coordinates for demo (you can also let OSRM handle it by not passing coordinates)
    const originCoords = {
      latitude: currentCity.coordinates.lat,
      longitude: currentCity.coordinates.lng,
    };
    const destCoords = {
      latitude: currentCity.coordinates.lat + 0.05,
      longitude: currentCity.coordinates.lng + 0.05,
    };

    try {
      const result = await optimizeRoute.mutateAsync({
        origin: originCoords,
        destination: destCoords,
        preference,
      });

      let routeData = null;

      if (result?.data?.recommendedRoute) routeData = result.data.recommendedRoute;
      else if (result?.recommendedRoute) routeData = result.recommendedRoute;
      else if (result?.data?.data?.recommendedRoute) routeData = result.data.data.recommendedRoute;
      else if (result?.data?.recommended_route) routeData = result.data.recommended_route;
      else if (result?.waypoints) routeData = result;

      if (routeData) {
        handleRouteCalculated(routeData);
      } else {
        toast.warning("Route calculated but cannot display on map");
      }
    } catch (error) {
      toast.error(
        "Failed to optimize route: " +
          (error.response?.data?.message || error.message || "Unknown error")
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="routes-page"
    >
      <h1>Route Optimization</h1>
      <p className="page-subtitle">
        Find the healthiest and fastest route based on real-time air quality
      </p>

      <div className="routes-container">
        <div className="route-form-card">
          <h3>Find Your Optimal Route</h3>
          <form onSubmit={handleOptimize}>
            <div className="form-group">
              <label>
                <FiMapPin /> Origin
              </label>
              <input
                type="text"
                placeholder="Enter starting point (e.g., Shivaji Nagar)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <FiNavigation /> Destination
              </label>
              <input
                type="text"
                placeholder="Enter destination (e.g., Hinjewadi)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <FiSliders /> Route Preference
              </label>
              <select
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
              >
                <option value="balanced">
                  ⚖️ Balanced (Time + Pollution)
                </option>
                <option value="cleanest">
                  🌿 Cleanest (Low Pollution Priority)
                </option>
                <option value="fastest">
                  ⚡ Fastest (Time Priority)
                </option>
              </select>
            </div>

            <button type="submit" disabled={optimizeRoute.isLoading} className="optimize-btn">
              {optimizeRoute.isLoading ? "🔄 Optimizing..." : "✨ Optimize Route"}
            </button>
          </form>
        </div>

        {/* Reuse the same route optimizer card from dashboard */}
        <div className="route-optimizer-card-wrapper">
          <RouteOptimizer
            city={currentCity}
            onRouteCalculated={handleRouteCalculated}
          />
        </div>

        {/* Map that shows the same routeData as Dashboard */}
        <div className="traffic-map-large">
          <TrafficMap
            city={currentCity}
            aqiData={null} // or pass from `useAQI` if you refine this page later
            onLocationSelect={() => {}} // no modal here, just reusing map
            routeData={routeData}
          />
        </div>

        {/* Optional: inline route result (you can keep or remove) */}
        {routeData && (
          <div className="route-result-card">
            <h3>✅ Recommended Route</h3>
            <div className="route-name">
              {routeData.name || "Optimal Route"}
            </div>
            <div className="route-details">
              <div className="route-stat">
                <FiMap />
                <span>Distance:</span>
                <strong>
                  {routeData.totalDistanceKm || routeData.total_distance_km || "N/A"} km
                </strong>
              </div>
              <div className="route-stat">
                <FiClock />
                <span>Est. Time:</span>
                <strong>
                  {routeData.estimatedTimeMinutes || routeData.estimated_time_minutes || "N/A"} min
                </strong>
              </div>
              <div className="route-stat">
                <FiWind />
                <span>Avg AQI:</span>
                <strong className={getAQIClass(routeData.averageAQI || routeData.average_aqi || 0)}>
                  {routeData.averageAQI || routeData.average_aqi || "N/A"}
                </strong>
              </div>
            </div>
            {routeData.recommendationReason && (
              <p className="route-reason">💡 {routeData.recommendationReason}</p>
            )}
          </div>
        )}
      </div>

      <div className="route-tips">
        <h3>💡 Travel Tips for Better Air Quality</h3>
        <ul>
          <li>🌅 Travel during early morning or late evening when pollution is lower</li>
          <li>🚲 Consider using public transport or cycling for short distances</li>
          <li>🗺️ Avoid routes passing through industrial areas or major traffic junctions</li>
          <li>😷 Keep an N95 mask handy when AQI exceeds 150</li>
          <li>📱 Check real-time AQI before starting your journey</li>
        </ul>
      </div>
    </motion.div>
  );
};

// Helper function for AQI color classes
function getAQIClass(aqi) {
  if (!aqi) return "";
  if (aqi <= 50) return "aqi-good";
  if (aqi <= 100) return "aqi-moderate";
  if (aqi <= 150) return "aqi-sensitive";
  if (aqi <= 200) return "aqi-unhealthy";
  if (aqi <= 300) return "aqi-very-unhealthy";
  return "aqi-hazardous";
}

export default Routes;
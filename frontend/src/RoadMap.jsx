
import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const defaultPosition = [30.7333, 76.7794];

// Map ko current location par move karna
function MapController({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, { duration: 1.5 });
        }
    }, [position, map]);

    return null;
}

function RoadMap({ reports = [] }) {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [locationError, setLocationError] = useState("");

    // Continuous GPS tracking
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentPosition([
                    position.coords.latitude,
                    position.coords.longitude,
                ]);
                setLocationError("");
                setTracking(true);
            },
            (error) => {
                setTracking(false);
                setLocationError(
                    error.code === 1
                        ? "Location permission denied. Please allow location access."
                        : "Unable to get your location."
                );
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const goToMyLocation = () => {
        if (currentPosition) {
            setLocationError("");
            return;
        }

        setLocationError("Waiting for GPS location...");
    };

    return (
        <div className="road-map-wrapper">
            <div className="map-location-bar">
                <button
                    type="button"
                    className="button-outline"
                    onClick={goToMyLocation}
                >
                    📍 My Location
                </button>

                <span>
                    {tracking ? "🟢 Live location active" : "Getting location..."}
                </span>
            </div>

            {locationError && (
                <p className="map-location-error">{locationError}</p>
            )}

            <MapContainer
                className="road-map"
                center={defaultPosition}
                zoom={12}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController position={currentPosition} />

                {/* Live user location */}
                {currentPosition && (
                    <CircleMarker
                        center={currentPosition}
                        radius={10}
                        pathOptions={{
                            color: "#2563eb",
                            fillColor: "#3b82f6",
                            fillOpacity: 1,
                            weight: 3,
                        }}
                    >
                        <Popup>
                            <strong>📍 Your Live Location</strong>
                            <br />
                            Latitude: {currentPosition[0].toFixed(6)}
                            <br />
                            Longitude: {currentPosition[1].toFixed(6)}
                        </Popup>
                    </CircleMarker>
                )}

                {/* Existing pothole report markers */}
                {reports
                    .filter(
                        (report) =>
                            report.latitude !== null &&
                            report.longitude !== null &&
                            Number.isFinite(Number(report.latitude)) &&
                            Number.isFinite(Number(report.longitude))
                    )
                    .map((report) => (
                        <CircleMarker
                            key={report.id}
                            center={[
                                Number(report.latitude),
                                Number(report.longitude),
                            ]}
                            radius={10}
                            pathOptions={{
                                color:
                                    report.severity === "High"
                                        ? "red"
                                        : report.severity === "Medium"
                                            ? "orange"
                                            : "green",
                                fillOpacity: 0.8,
                            }}
                        >
                            <Popup>
                                <strong>{report.location}</strong>
                                <br />
                                Severity: {report.severity}
                                <br />
                                {report.description}
                                <br />
                                Status: {report.status}
                            </Popup>
                        </CircleMarker>
                    ))}
            </MapContainer>
        </div>
    );
}

export default RoadMap;

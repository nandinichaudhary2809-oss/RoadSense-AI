import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function RoadMap({ reports = [] }) {
    // Default view: Chandigarh
    const defaultPosition = [30.7333, 76.7794];

    return (
        <MapContainer
            className="road-map"
            center={defaultPosition}
            zoom={12}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {reports
                .filter(
                    (report) =>
                        Number.isFinite(Number(report.latitude)) &&
                        Number.isFinite(Number(report.longitude)) &&
                        report.latitude !== null &&
                        report.longitude !== null
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
    );
}

export default RoadMap;

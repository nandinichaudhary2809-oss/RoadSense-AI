
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
            center={defaultPosition}
            zoom={12}
            style={{ height: "450px", width: "100%", borderRadius: "12px" }}
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
                    <Marker
                        key={report.id}
                        position={[
                            Number(report.latitude),
                            Number(report.longitude),
                        ]}
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
                    </Marker>
                ))}
        </MapContainer>
    );
}

export default RoadMap;

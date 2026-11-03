
import { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function MapClickHandler({ onSelect }) {
    useMapEvents({
        click(event) {
            onSelect(event.latlng.lat, event.latlng.lng);
        },
    });
    return null;
}

function MapCenter({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16);
        }
    }, [position, map]);

    return null;
}

export default function LocationPicker({ position, onSelect }) {
    const defaultPosition = [30.7333, 76.7794];

    return (
        <div className="location-picker">
            <MapContainer
                center={position || defaultPosition}
                zoom={13}
                style={{ height: "350px", width: "100%", borderRadius: "14px" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onSelect={onSelect} />
                <MapCenter position={position} />

                {position && (
                    <Marker position={position} icon={markerIcon} />
                )}
            </MapContainer>

            <p className="field-note">
                Click anywhere on the map to select the road location.
            </p>
        </div>
    );
}

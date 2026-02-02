import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [bounds, map]);
    return null;
}

const MapComponent = ({ points }) => {
    if (!points || points.length === 0) return null;

    // Convert points to Leaflet format [lat, lng]
    // Backend returns PascalCase properties: Latitude, Longitude
    const polylinePositions = points.map(p => [p.latitude || p.Latitude, p.longitude || p.Longitude]);

    return (
        <MapContainer 
            center={polylinePositions[0]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline 
                positions={polylinePositions} 
                pathOptions={{ color: 'blue', weight: 4 }} 
            />
            <ChangeView bounds={polylinePositions} />
        </MapContainer>
    );
};

export default MapComponent;

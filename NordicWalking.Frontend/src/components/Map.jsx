import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Komponent do automatycznego dopasowania widoku
function RecenterMap({ data }) {
    const map = useMap();
    useEffect(() => {
        if (data && data.features && data.features.length > 0) {
            const layer = L.geoJSON(data);
            map.fitBounds(layer.getBounds(), { padding: [40, 40] });
        }
    }, [data, map]);
    return null;
}

const Map = ({ trackSlug }) => {
    const [geoData, setGeoData] = useState(null);
    const [points, setPoints] = useState({ start: null, end: null });

    useEffect(() => {
        if (!trackSlug) return;

        fetch(`https://localhost:7055/api/tracks/${trackSlug}`)
            .then(res => {
                if (!res.ok) throw new Error('Nie znaleziono trasy');
                return res.json();
            })
            .then(data => {
                setGeoData(data);
                
                const coords = data.features[0].geometry.coordinates;
                if (coords.length > 0) {
                    const startP = coords[0];
                    const endP = coords[coords.length - 1];
                    
                    setPoints({
                        start: [startP[1], startP[0]],
                        end: [endP[1], endP[0]]
                    });
                }
            })
            .catch(err => {
                console.error('Błąd:', err);
                setGeoData(null);
            });
    }, [trackSlug]);

    return (
        <div className="w-full h-full relative border-2 border-gray-200 rounded-lg overflow-hidden">
            <MapContainer 
                center={[52.2297, 21.0122]} 
                zoom={13} 
                className='h-full w-full'
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{y}.png'
                />

                {geoData && (
                    <>
                        <GeoJSON
                            key={trackSlug}
                            data={geoData}
                            style={{ color: '#16a34a', weight: 5, opacity: 0.7 }}
                        />
                        
                        {points.start && (
                            <CircleMarker center={points.start} radius={8} pathOptions={{ color: 'white', fillColor: '#16a34a', fillOpacity: 1, weight: 2 }}>
                                <Popup>Start trasy</Popup>
                            </CircleMarker>
                        )}

                        {points.end && (
                            <CircleMarker center={points.end} radius={8} pathOptions={{ color: 'white', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}>
                                <Popup>Meta trasy</Popup>
                            </CircleMarker>
                        )}

                        <RecenterMap data={geoData} />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default Map;
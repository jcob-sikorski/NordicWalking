import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function RecenterMap({ data }) {
	const map = useMap();
	useEffect(() => {
		if (data) {
			const layer = L.geoJSON(data);
			map.fitBounds(layer.getBounds(), { padding: [30, 30] });
		}
	}, [data, map]);
	return null;
}

const Map = ({ trackSlug }) => {
	const [geoData, setGeoData] = useState(null);

	useEffect(() => {
		if (!trackSlug) return;

		fetch(`https://localhost:7055/api/tracks/${trackSlug}`)
			.then(res => {
				if (!res.ok) throw new Error('Nie znaleziono pliku trasy na serwerze');
				return res.json();
			})
			.then(data => {
				setGeoData(data);
			})
			.catch(err => {
				console.error('Błąd ładowania danych GeoJSON:', err);
				setGeoData(null);
			});
	}, [trackSlug]);

	return (
		<MapContainer center={[52.2518, 20.8905]} zoom={13} className='h-full w-full absolute inset-0'>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='https://{s}.tile.openstreetmap.org/{z}/{y}.png'
			/>

			{geoData && (
				<>
					<GeoJSON
						key={trackSlug}
						data={geoData}
						style={{
							color: '#22c55e',
							weight: 6,
							opacity: 0.8,
						}}
					/>
					<RecenterMap data={geoData} />
				</>
			)}
		</MapContainer>
	);
};

export default Map;

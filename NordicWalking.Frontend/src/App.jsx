import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ElevationChart from './components/ElevationChart';
import MapComponent from './components/MapComponent';

function App() {
    // --- STATE MANAGEMENT ---
    const [tracks, setTracks] = useState([]);          // List of available track metadata
    const [selectedTrack, setSelectedTrack] = useState(null); // The track currently being viewed
    const [chartData, setChartData] = useState([]);    // Simplified {dist, ele} objects for the chart
    const [mapPoints, setMapPoints] = useState([]);    // Full coordinate data for the Leaflet/Map view

    // --- INITIALIZATION ---
    useEffect(() => {
        console.log("[Frontend] Initializing - fetching track list...");
        // Fetch the directory listing from the .NET API
        fetch('http://localhost:5191/api/tracks')
            .then(res => res.json())
            .then(data => {
                // Sort tracks alphabetically by name (A-Z) for a better UI experience
                const sortedTracks = [...data].sort((a, b) => a.name.localeCompare(b.name));
                setTracks(sortedTracks);
            })
            .catch(err => console.error("Error fetching tracks:", err));
    }, []);

    // --- EVENT HANDLERS ---
    const handleTrackClick = (track) => {
        console.log(`[Frontend] Clicked track: ${track.name} (${track.slug})`);

        setSelectedTrack(track);
        setChartData([]); // Reset current views to show loading state
        setMapPoints([]);

        const url = `http://localhost:5191/api/tracks/${track.slug}`;
        console.log(`[Frontend] Fetching detailed data: ${url}`);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    console.error("Backend did not respond correctly.");
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    // 1. Update Map Data: Contains lat, lon, elevation, distance
                    setMapPoints(data);

                    // 2. Prepare Chart Data: 
                    // This mapping fixes the common "Case Sensitivity" issue between 
                    // C# (PascalCase) and JS (camelCase) JSON serialization.
                    const mappedData = data.map(p => {
                        const dist = p.distance !== undefined ? p.distance : p.Distance;
                        const ele = p.elevation !== undefined ? p.elevation : p.Elevation;
                        return {
                            distance: dist,
                            elevation: ele
                        };
                    });
                    
                    setChartData(mappedData);
                }
            })
            .catch(err => {
                console.error("API Connection Error", err);
            });
    };

    return (
        <Layout>
            <div className="flex h-full flex-col md:flex-row">

                {/* --- SIDEBAR: TRACK LIST --- */}
                <aside className="w-full md:w-80 bg-white border-r flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-700">Dostępne trasy ({tracks.length})</h2>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {tracks.map((track) => (
                            <div
                                key={track.slug}
                                onClick={() => handleTrackClick(track)}
                                // Dynamic classes: Highlight the active track in green
                                className={`p-4 cursor-pointer transition-all border-b hover:bg-gray-50 ${
                                    selectedTrack?.slug === track.slug ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900">{track.name}</h3>
                                    {/* Only show distance badge if data exists */}
                                    {track.distance > 0 && (
                                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                                            {track.distance} km
                                        </span>
                                    )}
                                </div>
                                
                                {/* Optional info: Time and Waypoints ("Przez") */}
                                {track.time > 0 && <p className="text-xs text-gray-500 mt-1">Czas: ~{track.time} min</p>}

                                {selectedTrack?.slug === track.slug && track.via && (
                                    <div className="mt-3 space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Przez:</p>
                                        {track.via.map((v, i) => (
                                            <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                                <span className="text-green-500">•</span> {v}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* --- MAIN AREA: MAP & CHART --- */}
                <main className="flex-1 flex flex-col relative bg-gray-100">
                    {/* TOP HALF: THE MAP */}
                    <div className="flex-1 relative">
                        {selectedTrack && mapPoints.length > 0 ? (
                            <div className="absolute inset-0">
                                <MapComponent points={mapPoints} />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">
                                {selectedTrack
                                    ? "Ładowanie mapy..."
                                    : "Wybierz trasę z listy, aby zobaczyć mapę"}
                            </div>
                        )}
                    </div>

                    {/* BOTTOM HALF: THE ELEVATION PROFILE */}
                    {selectedTrack && (
                        <div className="h-64 bg-white border-t p-6 shadow-2xl z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Profil wysokości</h4>
                                <div className="text-xs text-gray-400 italic">Dane z plików GPX</div>
                            </div>
                            <div className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 overflow-hidden relative">
                                {/* Passing the sanitized {distance, elevation} array here */}
                                <ElevationChart trackData={chartData} />
                            </div>
                        </div>
                    )}
                </main>

            </div>
        </Layout>
    );
}

export default App;
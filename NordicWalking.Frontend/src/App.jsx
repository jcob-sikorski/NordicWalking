import { useState } from 'react';
import Layout from './components/Layout';
import tracksData from './data/tracks';
import ElevationChart from './components/ElevationChart';
import Map from './components/Map';

function App() {
    const [selectedTrack, setSelectedTrack] = useState(null);

    const [chartData, setChartData] = useState([]);

    const handleTrackClick = (track) => {
        setSelectedTrack(track);

        setChartData([]);

      
        fetch(`https://localhost:7055/api/tracks/${track.slug}`)
            .then(response => {
                if (!response.ok) {
                    console.log("Backend nie odpowiada. Zostawiam dummy data.");
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data) {

                    //tylko dla wykresu
                    const mappedData = data.map(p => ({
                        distance: p.distance || p.Distance,
                        elevation: p.elevation || p.Elevation
                    }));
                    setChartData(mappedData);
                }
            })
            .catch(err => {
                console.error("Błąd połączenia z API", err);

            });
    };

    return (
        <Layout>
            <div className="flex h-full flex-col md:flex-row">

                {/* SIDEBAR */}
                <aside className="w-full md:w-80 bg-white border-r flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-700">Dostępne trasy ({tracksData.length})</h2>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {tracksData.map((track) => (
                            <div
                                key={track.slug}
                                
                                onClick={() => handleTrackClick(track)}
                                className={`p-4 cursor-pointer transition-all border-b hover:bg-gray-50 ${
                                    selectedTrack?.slug === track.slug ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900">{track.name}</h3>
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                    {track.distance} km
                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Czas: ~{track.time} min</p>

                                {selectedTrack?.slug === track.slug && (
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

                {/* MAIN AREA */}
                <main className="flex-1 flex flex-col relative bg-gray-100">
                    <div className="flex-1 relative">
                        {/* MIEJSCE NA MAPĘ */}
                        {selectedTrack ? (
                            <Map trackSlug={selectedTrack.slug} />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">
                              <p>Wybierz trasę z listy, aby zobaczyć mapę</p>
                            </div>
                          )}
                    </div>

                    {/* MIEJSCE NA WYKRES */}
                    {selectedTrack && (
                        <div className="h-64 bg-white border-t p-6 shadow-2xl z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Profil wysokości- przykładowe dane</h4>
                                <div className="text-xs text-gray-400 italic">Dane z plików GPX</div>
                            </div>
                            <div className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300">
                                {/* <ElevationChart trackData={selectedTrack.elevationData} />*/}
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
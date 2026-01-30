
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Tymczasowe dane
const dummyData = [
    { distance: 0, elevation: 120 },
    { distance: 0.5, elevation: 135 },
    { distance: 1.0, elevation: 125 },
    { distance: 1.5, elevation: 145 },
    { distance: 2.0, elevation: 160 },
    { distance: 2.5, elevation: 150 },
    { distance: 3.0, elevation: 155 },
    { distance: 3.5, elevation: 140 },
];

const ElevationChart = ({ trackData }) => {
    //  u¿ywamy dummyData
    const data = trackData && trackData.length > 0 ? trackData : dummyData;

    return (
        <div className="w-full h-full bg-white rounded-xl overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorEle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} /> {/* Zielony kolor z Tailwind */}
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="distance"
                        unit="km"
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="elevation"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEle)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ElevationChart;
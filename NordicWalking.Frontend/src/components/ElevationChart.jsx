import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * FALLBACK DATA
 * Used if a track is selected but hasn't finished loading or is missing data.
 * This provides a visual cue that the chart is working.
 */
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
    // 1. Data Selection: Use provided trackData or fall back to dummyData
    const data = trackData && trackData.length > 0 ? trackData : dummyData;

    /**
     * 2. DATA SANITIZATION (Defensive Programming)
     * Maps and charts crash if they receive 'NaN' or 'undefined' for coordinates.
     * We filter the data to ensure every point has a valid number for both axes.
     */
    const safeData = data.filter(d => 
        d.distance !== undefined && d.distance !== null && !isNaN(d.distance) &&
        d.elevation !== undefined && d.elevation !== null && !isNaN(d.elevation)
    );

    if (safeData.length === 0 && data.length > 0) {
        console.warn("[ElevationChart] All data points were filtered out due to invalid distance or elevation!");
    }

    return (
        /* ResponsiveContainer allows the chart to resize with the window (flex-1 in your App.js) */
        <ResponsiveContainer width="100%" height="100%" minHeight={100} minWidth={100}>
            <AreaChart
                data={safeData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                {/* 3. VISUAL STYLING: SVG Gradient 
                    Creates the 'fade-out' effect under the green line.
                */}
                <defs>
                    <linearGradient id="colorEle" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} /> {/* Tailwind green-500 */}
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>

                {/* Background grid lines (horizontal only for a cleaner look) */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                {/* X-AXIS: Distance in Kilometers */}
                <XAxis
                    dataKey="distance"
                    unit="km"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    type="number" 
                    domain={['dataMin', 'dataMax']} // Ensures the chart spans the full track width
                />

                {/* Y-AXIS: Elevation
                    Hidden to keep the UI minimal; users can see specific values in the Tooltip.
                    'auto' domain ensures the chart "zooms in" on the actual height variations.
                */}
                <YAxis
                    hide
                    domain={['auto', 'auto']} 
                />

                {/* POPUP TOOLTIP: Shows exact values on hover */}
                <Tooltip
                    contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                />

                {/* THE ACTUAL DATA LINE/AREA */}
                <Area
                    type="monotone" // Creates a smooth, curved line instead of jagged steps
                    dataKey="elevation"
                    stroke="#10b981" // The line color
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEle)" // Uses the gradient defined in <defs> above
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default ElevationChart;
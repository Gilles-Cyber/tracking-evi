import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion } from 'motion/react';
import { Truck, Plane, Ship, Wind } from 'lucide-react';

// Geocoding Cache to avoid redundant API calls
const geoCache: { [key: string]: [number, number] } = {
    'Paris': [48.8566, 2.3522],
    'New York': [40.7128, -74.0060],
    'London': [51.5074, -0.1278],
    'Dubai': [25.2048, 55.2708],
    'Tokyo': [35.6762, 139.6503],
    'Casablanca': [33.5731, -7.5898],
    'Marrakech': [31.6295, -7.9811],
    'Rabat': [34.0209, -6.8416],
};

async function fetchCoords(location: string): Promise<[number, number]> {
    if (!location) return [20, 0];
    const searchStr = location.split(',')[0].trim();
    if (geoCache[searchStr]) return geoCache[searchStr];

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`, {
            headers: { 'Accept-Language': 'en' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            geoCache[searchStr] = coords;
            return coords;
        }
    } catch (err) {
        console.warn(`Geocoding failed for ${location}, using default.`, err);
    }
    
    // Fuzzy fallback
    const lowerLoc = location.toLowerCase();
    for (const key in geoCache) {
        if (lowerLoc.includes(key.toLowerCase())) return geoCache[key];
    }

    return [20, 0];
}

function buildSmartCorridor(start: [number, number], end: [number, number]) {
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    const dLat = end[0] - start[0];
    const dLng = end[1] - start[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng) || 1;

    // Perpendicular vector for a subtle premium-looking curve.
    const normalLat = -dLng / distance;
    const normalLng = dLat / distance;
    const curveStrength = Math.min(6, Math.max(1.2, distance * 0.12));

    const curveA: [number, number] = [
        start[0] + dLat * 0.28 + normalLat * curveStrength,
        start[1] + dLng * 0.28 + normalLng * curveStrength,
    ];
    const curveB: [number, number] = [
        midLat + normalLat * (curveStrength * 0.55),
        midLng + normalLng * (curveStrength * 0.55),
    ];
    const curveC: [number, number] = [
        start[0] + dLat * 0.74 - normalLat * (curveStrength * 0.35),
        start[1] + dLng * 0.74 - normalLng * (curveStrength * 0.35),
    ];

    return [start, curveA, curveB, curveC, end];
}

interface ShipmentMapProps {
    origin: string;
    dest: string;
    waypoints?: string[];
    progress: number;
    simMode: 'ground' | 'air' | 'sea';
    isSpoiled: boolean;
    accent: { trace: string; bg: string; border: string; glow: string };
}

export function ShipmentMap({ origin, dest, waypoints = [], progress, simMode, isSpoiled, accent }: ShipmentMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const polylineRef = useRef<L.Polyline | null>(null);
    const cityMarkersRef = useRef<L.Marker[]>([]);
    const lastBoundsKey = useRef<string | null>(null);

    const [coords, setCoords] = React.useState<{ routeCoords: [number, number][]; routeLabels: string[] } | null>(null);

    useEffect(() => {
        async function loadCoords() {
            const cleanedWaypoints = waypoints.map((item) => item.trim()).filter(Boolean);
            const hasManualWaypoints = cleanedWaypoints.length > 0;
            const routeLabels = hasManualWaypoints
                ? [origin, ...cleanedWaypoints, dest].filter(Boolean)
                : [origin, 'Auto corridor A', 'Auto corridor B', 'Auto corridor C', dest].filter(Boolean);

            let routeCoords: [number, number][];
            if (hasManualWaypoints) {
                routeCoords = await Promise.all(routeLabels.map((label) => fetchCoords(label)));
            } else {
                const start = await fetchCoords(origin);
                const end = await fetchCoords(dest);
                routeCoords = buildSmartCorridor(start, end);
            }

            setCoords({ routeCoords, routeLabels });
        }
        loadCoords();
    }, [origin, dest, waypoints]);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize Map
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapContainer.current, {
                center: [20, 0],
                zoom: 2,
                zoomControl: false,
                attributionControl: false
            });

            // Dark Theme Tiles (CartoDB Dark Matter)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
            }).addTo(mapInstance.current);
        }

        if (!coords) return;

        const routeCoords = coords.routeCoords;
        const routeLabels = coords.routeLabels;
        if (routeCoords.length < 2) return;
        const startCoords = routeCoords[0];
        const endCoords = routeCoords[routeCoords.length - 1];

        // Clear existing city markers if they exist
        cityMarkersRef.current.forEach(m => m.remove());
        cityMarkersRef.current = [];

        // City Markers
        const cityIcon = (label: string) => L.divIcon({
            className: 'city-marker',
            html: `
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 bg-white rounded-full shadow-[0_0_8px_white]"></div>
                    <div class="mt-1 bg-[#0F72A6]/80 backdrop-blur px-2 py-0.5 rounded border border-white/10">
                        <span class="text-[9px] font-bold text-slate-300 uppercase tracking-widest">${label}</span>
                    </div>
                </div>
            `,
            iconSize: [60, 40],
            iconAnchor: [30, 15]
        });

        routeCoords.forEach((point, index) => {
            const rawLabel = routeLabels[index] || '';
            if (rawLabel.startsWith('Auto corridor')) return;
            const compactLabel = rawLabel.split(',')[0].trim();
            cityMarkersRef.current.push(L.marker(point, { icon: cityIcon(compactLabel) }).addTo(mapInstance.current));
        });

        // Draw or Update Route
        if (!polylineRef.current) {
            polylineRef.current = L.polyline(routeCoords, {
                color: accent.trace,
                weight: 3,
                opacity: 0.6,
                dashArray: '10, 10'
            }).addTo(mapInstance.current);
        } else {
            polylineRef.current.setLatLngs(routeCoords);
        }

        // Calculate vehicle position across the full route rather than a single straight segment.
        const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
        const segments = routeCoords.slice(0, -1).map((point, index) => {
            const next = routeCoords[index + 1];
            return {
                from: point,
                to: next,
                length: L.latLng(point[0], point[1]).distanceTo(L.latLng(next[0], next[1]))
            };
        });
        const totalDistance = segments.reduce((sum, segment) => sum + segment.length, 0) || 1;
        let distanceCursor = (safeProgress / 100) * totalDistance;
        let lat = startCoords[0];
        let lng = startCoords[1];

        for (const segment of segments) {
            if (distanceCursor <= segment.length) {
                const ratio = segment.length === 0 ? 0 : distanceCursor / segment.length;
                lat = segment.from[0] + (segment.to[0] - segment.from[0]) * ratio;
                lng = segment.from[1] + (segment.to[1] - segment.from[1]) * ratio;
                break;
            }
            distanceCursor -= segment.length;
            lat = segment.to[0];
            lng = segment.to[1];
        }

        if (isNaN(lat) || isNaN(lng)) return;

        // Custom Vehicle Icon HTML
        const iconHtml = `
            <div class="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0F72A6] border-2 ${accent.border} ${accent.glow} backdrop-blur-md">
                ${safeProgress > 0 && safeProgress < 100 ? `<div class="absolute inset-0 rounded-full animate-ping opacity-20 ${accent.bg}"></div>` : ''}
                ${simMode === 'ground' ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>' : ''}
                ${simMode === 'air' ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-sky-400"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>' : ''}
                ${simMode === 'sea' ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4a11.6 11.6 0 0 0 1.62 6"/><path d="M12 3v7"/><path d="M12 10.15 19 14h-7z"/></svg>' : ''}
                ${isSpoiled ? '<div class="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"><div class="w-2 h-2 rounded-full bg-slate-400/60 animate-bounce"></div><div class="w-1.5 h-1.5 rounded-full bg-slate-400/40 animate-bounce" style="animation-delay: 0.2s"></div></div>' : ''}
            </div>
        `;

        const vehicleIcon = L.divIcon({
            className: 'custom-vehicle-icon',
            html: iconHtml,
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        });

        // Update or Create Vehicle Marker
        if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng], { 
                icon: vehicleIcon, 
                zIndexOffset: 1000 
            }).addTo(mapInstance.current);
        } else {
            // Always update icon in case status changed (truck -> plane, or spoiled)
            markerRef.current.setIcon(vehicleIcon);
            markerRef.current.setLatLng([lat, lng]);
        }

        // Add CSS transition for smooth glide directly to the DOM element
        const markerEl = markerRef.current.getElement();
        if (markerEl) {
            markerEl.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        // Zoom to fit route only if origin or dest changed
        const boundsKey = routeLabels.join('|');
        if (mapInstance.current && boundsKey !== lastBoundsKey.current) {
            const bounds = L.latLngBounds(routeCoords);
            mapInstance.current.fitBounds(bounds, { padding: [100, 100], duration: 1.5 });
            lastBoundsKey.current = boundsKey;
        }

    }, [origin, dest, waypoints, progress, simMode, isSpoiled, accent, coords]);

    return (
        <div className="w-full h-full relative">
            <div ref={mapContainer} className="w-full h-full" />
            
            {/* Overlay Grid for Luxury Feel */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        </div>
    );
}

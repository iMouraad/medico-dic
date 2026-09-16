'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ECUADOR_CENTER: [number, number] = [-1.8312, -78.1834];

const pinIcon = L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#01B5BD" stroke="#ffffff" stroke-width="1"><path d="M12 22s8-7.58 8-13a8 8 0 1 0-16 0c0 5.42 8 13 8 13z"/><circle cx="12" cy="9" r="3" fill="#ffffff"/></svg>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Solo recentra el mapa cuando `focusToken` cambia (ej. tras usar "Buscar en
// el mapa"); un click o arrastre del médico no debe mover la cámara, solo
// mover el pin.
function FlyToOnToken({ position, focusToken }: { position: [number, number] | null; focusToken: number }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 16, { duration: 0.75 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusToken]);
    return null;
}

interface Props {
    latitude: number | null;
    longitude: number | null;
    focusToken: number;
    onChange: (lat: number, lng: number) => void;
}

export default function UbicacionMapaPicker({ latitude, longitude, focusToken, onChange }: Props) {
    const position: [number, number] | null = latitude != null && longitude != null ? [latitude, longitude] : null;

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-100">
            <MapContainer
                center={position ?? ECUADOR_CENTER}
                zoom={position ? 16 : 6}
                style={{ height: '320px', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickHandler onPick={onChange} />
                <FlyToOnToken position={position} focusToken={focusToken} />
                {position && (
                    <Marker
                        position={position}
                        icon={pinIcon}
                        draggable
                        eventHandlers={{
                            dragend: (e) => {
                                const marker = e.target as L.Marker;
                                const { lat, lng } = marker.getLatLng();
                                onChange(lat, lng);
                            },
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}

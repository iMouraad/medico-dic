'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { MapPin, ShieldCheck } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export interface DoctorPin {
    id: number;
    name: string;
    specialty: string;
    city: string;
    consultation_price: number | null;
    profile_photo_url: string;
    verified_senescyt: boolean;
    latitude: number | null;
    longitude: number | null;
}

interface Props {
    doctors: DoctorPin[];
    focus?: { lat: number; lng: number } | null;
    emptyMessage?: string;
    hideHeading?: boolean;
    height?: number;
}

// Centro aproximado de Ecuador continental, usado cuando todavía no hay
// ningún médico con ubicación geocodificada ni ciudad buscada.
const ECUADOR_CENTER: [number, number] = [-1.8312, -78.1834];

const FOTO_DEFAULT = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100';

// Solo se usa dentro de un atributo HTML entre comillas dobles: basta con
// escapar comillas dobles para que una URL con caracteres raros no rompa el
// marcado del ícono.
function escapeAttr(value: string) {
    return value.replace(/"/g, '&quot;');
}

// Pin con la foto de perfil del médico (en vez de un ícono genérico), para
// que el mapa se identifique de un vistazo con quién es cada consultorio.
function crearPinAvatar(doctor: DoctorPin) {
    const foto = escapeAttr(doctor.profile_photo_url || FOTO_DEFAULT);
    return L.divIcon({
        className: '',
        html: `
            <div style="position:relative;width:44px;height:54px;">
                <div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:3px solid #01B5BD;box-shadow:0 3px 8px rgba(0,0,0,0.4);background:#fff;">
                    <img src="${foto}" style="width:100%;height:100%;object-fit:cover;display:block;" />
                </div>
                <div style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid #01B5BD;"></div>
            </div>
        `,
        iconSize: [44, 54],
        iconAnchor: [22, 54],
        popupAnchor: [0, -50],
    });
}

// Mueve/encuadra el mapa cuando cambia la ciudad buscada o la lista de
// médicos visibles. `center`/`zoom` de <MapContainer> solo aplican en el
// primer render de Leaflet, así que cualquier movimiento posterior hay que
// hacerlo a mano con la instancia del mapa vía useMap().
function MapController({ focus, markers }: { focus: { lat: number; lng: number } | null | undefined; markers: DoctorPin[] }) {
    const map = useMap();
    const animateRef = useRef(false);
    const markersKey = markers.map((m) => `${m.id}:${m.latitude}:${m.longitude}`).join('|');

    useEffect(() => {
        const duration = animateRef.current ? 1 : 0;

        if (focus) {
            map.flyTo([focus.lat, focus.lng], 13, { duration });
            animateRef.current = true;
            return;
        }

        if (markers.length > 0) {
            const bounds = L.latLngBounds(
                markers.map((m) => [m.latitude as number, m.longitude as number] as [number, number])
            );
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14, duration });
            animateRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focus, markersKey, map]);

    return null;
}

export default function MapaMedicos({ doctors, focus, emptyMessage, hideHeading, height = 460 }: Props) {
    const conUbicacion = useMemo(
        () => doctors.filter((d) => d.latitude != null && d.longitude != null),
        [doctors]
    );

    return (
        <section id={hideHeading ? undefined : 'mapa-medicos'} className="w-full py-8 scroll-mt-24">
            {!hideHeading && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Encuentra tu médico en el mapa</span>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <MapContainer
                    center={ECUADOR_CENTER}
                    zoom={6}
                    scrollWheelZoom={false}
                    style={{ height: `${height}px`, width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController focus={focus} markers={conUbicacion} />
                    {conUbicacion.map((doctor) => (
                        <Marker
                            key={doctor.id}
                            position={[doctor.latitude as number, doctor.longitude as number]}
                            icon={crearPinAvatar(doctor)}
                        >
                            <Tooltip permanent direction="right" offset={[16, -20]} className="etiqueta-medico">
                                {doctor.name}
                            </Tooltip>
                            <Popup>
                                <div className="flex items-center gap-2 min-w-[190px]">
                                    <img
                                        src={doctor.profile_photo_url || FOTO_DEFAULT}
                                        alt={doctor.name}
                                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-sm text-slate-800 truncate">{doctor.name}</span>
                                            {doctor.verified_senescyt && (
                                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-xs text-blue-600 font-semibold block truncate">
                                            {doctor.specialty}
                                        </span>
                                        <span className="text-[11px] text-slate-500 font-bold block">
                                            {doctor.consultation_price != null ? `$${doctor.consultation_price} consulta` : 'Consultar precio'}
                                        </span>
                                        <Link
                                            href={`/medicos/${doctor.id}`}
                                            className="text-[11px] font-bold text-slate-500 hover:text-blue-600 underline"
                                        >
                                            Ver perfil →
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {conUbicacion.length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-400 font-medium">
                        {emptyMessage ?? 'Todavía no hay médicos con ubicación registrada.'}
                    </div>
                )}
            </div>
        </section>
    );
}

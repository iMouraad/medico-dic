'use client';

import { useEffect, useState } from 'react';
import { LocateFixed, Loader2, MapPinOff } from 'lucide-react';
import TarjetaMedicoFila from './TarjetaMedicoFila';
import { distanciaKm } from '@/app/lib/distancia';
import type { HorarioAtencion } from '@/app/lib/types';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    sector?: string | null;
    whatsapp: string;
    profile_photo_url: string;
    horario_atencion?: HorarioAtencion | null;
    latitude: number | null;
    longitude: number | null;
}

// Radio razonable para "cerca de ti"; si nadie cae dentro, igual mostramos
// los más cercanos que haya en el país en vez de una lista vacía.
const RADIO_KM = 30;

type Estado = 'inicial' | 'buscando' | 'lista' | 'denegado' | 'no_soportado';

export default function MedicosCercaDeTi({ doctors }: { doctors: Doctor[] }) {
    const [estado, setEstado] = useState<Estado>('inicial');
    const [cercanos, setCercanos] = useState<(Doctor & { distancia: number })[]>([]);

    const conUbicacion = doctors.filter((d) => d.latitude != null && d.longitude != null);

    const pedirUbicacion = () => {
        if (!('geolocation' in navigator)) {
            setEstado('no_soportado');
            return;
        }
        setEstado('buscando');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const conDistancia = conUbicacion
                    .map((d) => ({
                        ...d,
                        distancia: distanciaKm(latitude, longitude, d.latitude as number, d.longitude as number),
                    }))
                    .sort((a, b) => a.distancia - b.distancia);

                const dentroDeRadio = conDistancia.filter((d) => d.distancia <= RADIO_KM);
                setCercanos(dentroDeRadio.length > 0 ? dentroDeRadio : conDistancia);
                setEstado('lista');
            },
            () => setEstado('denegado'),
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
        );
    };

    // Se pide apenas carga la sección: es el corazón de esta función, no
    // tiene sentido esperar un clic extra para algo que el usuario ya vino
    // a buscar (médicos cerca de él). Si la rechaza, queda el botón para
    // reintentar sin recargar la página.
    useEffect(() => {
        // Vía microtarea para que el primer setState quede fuera del cuerpo
        // síncrono del efecto (evita renders en cascada).
        Promise.resolve().then(pedirUbicacion);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (conUbicacion.length === 0) return null;

    return (
        <section>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                <LocateFixed className="w-4 h-4 text-brand-turquoise" />
                <span>Médicos cerca de ti</span>
            </div>

            {estado === 'lista' && (
                <p className="text-xs font-bold text-slate-400 mb-4">
                    Mostrando {cercanos.length} {cercanos.length === 1 ? 'médico' : 'médicos'}
                </p>
            )}

            {(estado === 'inicial' || estado === 'buscando') && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-3 text-sm text-slate-500 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-turquoise" />
                    Buscando médicos cerca de ti...
                </div>
            )}

            {(estado === 'denegado' || estado === 'no_soportado') && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
                    <MapPinOff className="w-8 h-8 text-slate-300 flex-shrink-0" />
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-sm font-bold text-slate-700">No pudimos acceder a tu ubicación</p>
                        <p className="text-xs text-slate-400">
                            {estado === 'no_soportado'
                                ? 'Tu navegador no soporta geolocalización.'
                                : 'Actívala en tu navegador para ver los médicos más cercanos a ti.'}
                        </p>
                    </div>
                    {estado === 'denegado' && (
                        <button
                            type="button"
                            onClick={pedirUbicacion}
                            className="flex-shrink-0 text-xs font-bold text-white bg-brand-turquoise hover:brightness-95 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                            Reintentar
                        </button>
                    )}
                </div>
            )}

            {estado === 'lista' && (
                <div className="flex flex-col gap-3">
                    {cercanos.slice(0, 6).map((doctor) => (
                        <TarjetaMedicoFila key={doctor.id} doctor={doctor} distanciaKm={doctor.distancia} />
                    ))}
                </div>
            )}
        </section>
    );
}

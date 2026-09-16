'use client';

import Link from 'next/link';
import { ChevronRight, MapPin, MessageCircle, CheckCircle2 } from 'lucide-react';
import { getDiaSemana } from '@/app/lib/horarioAtencion';
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
}

const FOTO_DEFAULT = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200';

export default function TarjetaMedicoFila({ doctor, distanciaKm }: { doctor: Doctor; distanciaKm?: number }) {
    const atiendeHoy = doctor.horario_atencion?.[getDiaSemana(new Date())]?.activo ?? false;

    const handleWhatsApp = () => {
        const mensaje = `Hola ${doctor.name}, vi su perfil en NeosDoc y deseo agendar una consulta.`;
        window.open(`https://wa.me/${doctor.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-4">
            <img
                src={doctor.profile_photo_url || FOTO_DEFAULT}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover border border-slate-100 flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
                <Link href={`/medicos/${doctor.id}`} className="font-extrabold text-sm text-brand-blue-dark hover:text-brand-blue truncate block">
                    {doctor.name}
                </Link>
                <p className="text-xs font-bold text-brand-blue mb-1.5">{doctor.specialty}</p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {doctor.sector ? `${doctor.city}, ${doctor.sector}` : doctor.city}
                        {distanciaKm != null && (
                            <span className="text-slate-400"> · {distanciaKm < 1 ? '<1 km' : `${distanciaKm.toFixed(0)} km`}</span>
                        )}
                    </span>
                </div>

                {atiendeHoy && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-available-green bg-available-green/10 border border-available-green/20 px-2 py-0.5 rounded-full mt-1.5 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Agenda disponible hoy
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={handleWhatsApp}
                    aria-label="Contactar por WhatsApp"
                    className="w-10 h-10 rounded-full bg-whatsapp-green text-white flex items-center justify-center hover:brightness-95 transition cursor-pointer active:scale-95"
                >
                    <MessageCircle className="w-4.5 h-4.5" />
                </button>
                <Link href={`/medicos/${doctor.id}`} aria-label="Ver perfil" className="text-slate-300 hover:text-brand-turquoise transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}

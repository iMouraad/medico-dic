'use client';

import Link from 'next/link';
import { ShieldCheck, MapPin, Heart, MessageCircle, CalendarCheck } from 'lucide-react';
import { getDiaSemana } from '@/app/lib/horarioAtencion';
import { toggleFavorito, useEsFavorito } from '@/app/lib/favoritos';
import type { HorarioAtencion } from '@/app/lib/types';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    consultation_price: number | null;
    whatsapp: string;
    plan: string;
    profile_photo_url: string;
    modalities: string[];
    verified_senescyt: boolean;
    horario_atencion?: HorarioAtencion | null;
}

export default function TarjetaMedico({ doctor }: { doctor: Doctor }) {
    const isFavorite = useEsFavorito(doctor.id);

    const atiendeHoy = doctor.horario_atencion?.[getDiaSemana(new Date())]?.activo ?? false;

    const handleWhatsApp = () => {
        const mensaje = `Hola ${doctor.name}, vi su perfil en el directorio médico y deseo agendar una consulta.`;
        const url = `https://wa.me/${doctor.whatsapp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    return (
        <div className={`group relative border rounded-2xl p-4 bg-white transition-all duration-300 flex flex-row items-center gap-4 hover:-translate-y-1 hover:shadow-lg ${
            doctor.plan === 'Destacado'
                ? 'border-amber-200/80 shadow-[0_8px_30px_rgba(245,158,11,0.06)] bg-white'
                : 'border-slate-100 shadow-xs hover:border-slate-200'
        }`}>
            {/* Tag Premium */}
            {doctor.plan === 'Destacado' && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider z-10">
                    PREMIUM
                </div>
            )}

            {/* Favorite Heart Icon */}
            <button
                onClick={() => toggleFavorito(doctor.id)}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors z-10 cursor-pointer"
            >
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            </button>

            {/* Profile Photo */}
            <div className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24">
                <img
                    src={doctor.profile_photo_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"}
                    alt={doctor.name}
                    className="w-full h-full rounded-xl object-cover border border-slate-100"
                />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                <div>
                    {/* Name & Verification */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-sm md:text-base text-slate-800 truncate leading-snug group-hover:text-blue-600 transition-colors">
                            {doctor.name}
                        </h3>
                        {doctor.verified_senescyt && (
                            <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 flex-shrink-0" />
                        )}
                    </div>

                    {/* Specialty */}
                    <p className="text-xs font-semibold text-blue-600 leading-none mb-1">
                        {doctor.specialty}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span>{doctor.city}</span>
                    </div>

                    {atiendeHoy && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-available-green bg-available-green/10 border border-available-green/20 px-2 py-0.5 rounded-full w-fit">
                            <CalendarCheck className="w-3 h-3" />
                            Agenda disponible
                        </span>
                    )}
                </div>

                {/* Bottom Row: Price and WhatsApp Button */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-500">
                        Consulta:{' '}
                        <span className="text-sm font-extrabold text-blue-600">
                            {doctor.consultation_price != null ? `$${doctor.consultation_price}` : 'Consultar'}
                        </span>
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleWhatsApp}
                            aria-label="Contactar por WhatsApp"
                            className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-100 transition-all duration-200 cursor-pointer active:scale-95"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <Link
                            href={`/medicos/${doctor.id}`}
                            className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-lg border border-blue-100 transition-all duration-200 cursor-pointer active:scale-95"
                        >
                            Ver perfil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import { ShieldCheck, MapPin, MessageCircle } from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    consultation_price: number;
    whatsapp: string;
    plan: string;
    profile_photo_url: string;
    modalities: string[];
    verified_senescyt: boolean;
}

export default function TarjetaMedico({ doctor }: { doctor: Doctor }) {
    const handleWhatsApp = () => {
        const mensaje = `Hola ${doctor.name}, vi su perfil en el directorio médico y deseo agendar una consulta.`;
        const url = `https://wa.me/${doctor.whatsapp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    return (
        <div className={`group relative border rounded-2xl p-5 bg-white transition-all duration-350 flex flex-col items-center hover:-translate-y-1.5 ${
            doctor.plan === 'Destacado'
                ? 'border-amber-400/80 shadow-[0_8px_30px_rgba(245,158,11,0.08)] animate-card-glow'
                : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
        }`}>
            {doctor.plan === 'Destacado' && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[9px] uppercase font-extrabold px-3 py-1 rounded-bl-xl tracking-widest shadow-xs">
                    Destacado
                </div>
            )}

            {/* Foto de perfil con anillo premium */}
            <div className="relative mt-2 group-hover:scale-105 transition-transform duration-300">
                <div className={`p-1 rounded-full bg-gradient-to-tr ${
                    doctor.plan === 'Destacado' 
                        ? 'from-amber-400 via-orange-500 to-yellow-300' 
                        : 'from-blue-500/20 via-indigo-500/10 to-cyan-400/25'
                }`}>
                    <img
                        src={doctor.profile_photo_url}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white bg-white shadow-inner"
                    />
                </div>
                {doctor.verified_senescyt && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white p-1 rounded-full shadow-md border border-white flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            {/* Nombre y Especialidad */}
            <div className="mt-4 flex flex-col items-center">
                <h3 className="font-bold text-base text-slate-800 leading-snug tracking-tight group-hover:text-blue-600 transition-colors text-center">
                    {doctor.name}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider text-center">
                    {doctor.specialty}
                </p>
            </div>

            {/* Sello de verificación */}
            {doctor.verified_senescyt && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50/60 border border-emerald-100/50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot" />
                    <span>VERIFICADO SENESCYT</span>
                </div>
            )}

            {/* Detalles de Consulta (Alineados horizontalmente y estructurados) */}
            <div className="mt-5 w-full flex items-center justify-between border-t border-slate-100/80 pt-3.5 text-xs text-slate-500">
                <div className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-600 truncate">{doctor.city}</span>
                </div>
                <div className="text-right flex-shrink-0">
                    <span className="text-[9px] uppercase font-bold text-slate-450 block tracking-wider leading-none mb-1">Consulta</span>
                    <span className="text-sm font-extrabold text-blue-600">${doctor.consultation_price}</span>
                </div>
            </div>

            {/* Badges de modalidad */}
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center w-full">
                {doctor.modalities.map((mod) => (
                    <span
                        key={mod}
                        className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md"
                    >
                        {mod}
                    </span>
                ))}
            </div>

            {/* Botón WhatsApp */}
            <button
                onClick={handleWhatsApp}
                className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-750 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-md shadow-emerald-500/10 hover:shadow-emerald-600/20 active:scale-[0.98] cursor-pointer"
            >
                <MessageCircle className="w-4 h-4 fill-white/10" />
                <span>Reservar Consulta</span>
            </button>
        </div>
    );
}
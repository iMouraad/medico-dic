'use client';

import { useState } from 'react';
import { Calendar, MessageCircle } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import type { Doctor } from '@/app/lib/types';
import AgendarCitaModal from './AgendarCitaModal';

export default function ContactButtons({ doctor }: { doctor: Doctor }) {
    const [showAgendar, setShowAgendar] = useState(false);

    const trackWhatsappClick = () => {
        const supabase = createClient();
        supabase.rpc('increment_doctor_stat', { target_id: doctor.id, stat_name: 'whatsapp_clicks' });
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-50">
                <button
                    onClick={() => setShowAgendar(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-750 text-white font-bold text-sm px-6 py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
                >
                    <Calendar className="w-4 h-4" />
                    Agendar cita
                </button>
                {doctor.whatsapp && (
                    <a
                        href={`https://wa.me/${doctor.whatsapp}?text=${encodeURIComponent(`Hola ${doctor.name ?? ''}, vi su perfil en NEOSDOC y deseo agendar una consulta.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={trackWhatsappClick}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-bold text-sm px-6 py-3 rounded-xl border border-emerald-100 transition duration-200 cursor-pointer active:scale-98"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Contactar por WhatsApp
                    </a>
                )}
            </div>

            {showAgendar && <AgendarCitaModal doctor={doctor} onClose={() => setShowAgendar(false)} />}
        </>
    );
}

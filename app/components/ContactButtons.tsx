'use client';

import { MessageCircle, CalendarCheck } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import type { Doctor } from '@/app/lib/types';

export default function ContactButtons({ doctor }: { doctor: Doctor }) {
    if (!doctor.whatsapp) return null;

    const track = (stat: 'whatsapp_clicks' | 'appointment_clicks') => {
        const supabase = createClient();
        supabase.rpc('increment_doctor_stat', { target_id: doctor.id, stat_name: stat });
    };

    const waLink = (mensaje: string) =>
        `https://wa.me/${doctor.whatsapp}?text=${encodeURIComponent(mensaje)}`;

    return (
        <div
            className="fixed bottom-0 inset-x-0 z-[1000] bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="max-w-4xl mx-auto flex gap-3 p-3">
                <a
                    href={waLink(`Hola ${doctor.name ?? ''}, vi su perfil en NeosDoc y deseo más información.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('whatsapp_clicks')}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-whatsapp-green hover:brightness-95 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm"
                >
                    <MessageCircle className="w-4 h-4" />
                    Contactar por WhatsApp
                </a>
                <a
                    href={waLink(`Hola ${doctor.name ?? ''}, vi su perfil en NeosDoc y quiero agendar una cita.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('appointment_clicks')}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-turquoise hover:brightness-95 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm"
                >
                    <CalendarCheck className="w-4 h-4" />
                    Agendar cita
                </a>
            </div>
        </div>
    );
}

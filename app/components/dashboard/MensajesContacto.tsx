'use client';

import { useMemo, useState } from 'react';
import { Mail, Phone, Clock, CircleDot, Inbox, MailOpen, Lightbulb } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import type { ContactMessage } from '@/app/lib/types';
import { formatFechaHora } from '@/app/lib/dateFormat';
import StatCard from './StatCard';

export default function MensajesContacto({ initialMessages }: { initialMessages: ContactMessage[] }) {
    const [mensajes, setMensajes] = useState(initialMessages);
    const sinLeer = useMemo(() => mensajes.filter((m) => !m.leido).length, [mensajes]);

    const marcarLeido = async (id: number) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('contact_messages')
            .update({ leido: true })
            .eq('id', id)
            .select()
            .single();
        if (!error && data) setMensajes((prev) => prev.map((m) => (m.id === id ? (data as ContactMessage) : m)));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Mensajes totales" value={mensajes.length} icon={Inbox} color="blue" />
                <StatCard label="Sin leer" value={sinLeer} icon={MailOpen} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    {mensajes.length === 0 ? (
                        <div className="p-10 text-center text-sm text-slate-400 font-medium">
                            No tienes mensajes todavía.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {mensajes.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => !m.leido && marcarLeido(m.id)}
                                    className={`w-full text-left flex flex-col gap-2 p-4 cursor-pointer transition-colors ${
                                        !m.leido ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50/70'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            {!m.leido && <CircleDot className="w-3 h-3 text-blue-600 flex-shrink-0" />}
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="font-bold text-slate-700">{m.email}</span>
                                            {m.whatsapp_paciente && (
                                                <>
                                                    <Phone className="w-3.5 h-3.5 ml-2" />
                                                    <span>{m.whatsapp_paciente}</span>
                                                </>
                                            )}
                                        </div>
                                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            {formatFechaHora(new Date(m.created_at))}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{m.mensaje}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col gap-3 lg:sticky lg:top-6">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Lightbulb className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800">Cómo responder</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Estos mensajes no se contestan desde aquí: usa el correo o el WhatsApp que dejó el paciente
                        para responderle directamente. Al abrir un mensaje se marca como leído.
                    </p>
                </div>
            </div>
        </div>
    );
}

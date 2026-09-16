'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { HORARIO_ATENCION_DEFAULT, type Appointment, type HorarioAtencion } from '@/app/lib/types';
import CalendarioCitas from './CalendarioCitas';
import NuevaCitaModal from './NuevaCitaModal';

interface Props {
    initialAppointments: Appointment[];
    doctorId?: number;
    defaultDuration?: number;
    horario?: HorarioAtencion;
    diasBloqueados?: string[];
}

export default function CitasMedico({
    initialAppointments,
    doctorId,
    defaultDuration = 30,
    horario = HORARIO_ATENCION_DEFAULT,
    diasBloqueados = [],
}: Props) {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [showNuevaCita, setShowNuevaCita] = useState(false);
    const [fechaNuevaCita, setFechaNuevaCita] = useState<string | undefined>(undefined);

    const updateAppointment = async (id: number, patch: Partial<Pick<Appointment, 'status' | 'preferred_at'>>) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('appointments').update(patch).eq('id', id).select().single();
        if (!error && data) {
            setAppointments((prev) => prev.map((a) => (a.id === id ? (data as Appointment) : a)));
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {doctorId && (
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            setFechaNuevaCita(undefined);
                            setShowNuevaCita(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Registrar cita
                    </button>
                </div>
            )}

            <CalendarioCitas
                appointments={appointments}
                horario={horario}
                diasBloqueados={diasBloqueados}
                onConfirmar={(id) => updateAppointment(id, { status: 'confirmada' })}
                onCancelar={(id) => updateAppointment(id, { status: 'cancelada' })}
                onCompletar={(id) => updateAppointment(id, { status: 'completada' })}
                onReprogramar={(id, isoDate) => updateAppointment(id, { preferred_at: isoDate, status: 'confirmada' })}
                onCrearEnFecha={
                    doctorId
                        ? (fechaISO) => {
                              setFechaNuevaCita(fechaISO);
                              setShowNuevaCita(true);
                          }
                        : undefined
                }
            />

            {showNuevaCita && doctorId && (
                <NuevaCitaModal
                    doctorId={doctorId}
                    initialDate={fechaNuevaCita}
                    defaultDuration={defaultDuration}
                    appointments={appointments}
                    horario={horario}
                    diasBloqueados={diasBloqueados}
                    onClose={() => setShowNuevaCita(false)}
                    onCreated={(appointment) => {
                        setAppointments((prev) => [...prev, appointment]);
                        setShowNuevaCita(false);
                    }}
                />
            )}
        </div>
    );
}

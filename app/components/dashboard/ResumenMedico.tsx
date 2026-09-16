import Link from 'next/link';
import { Eye, Mail, MessageCircle, ArrowRight, AlertCircle, Calendar, Flame } from 'lucide-react';
import type { ActivityStreak, Doctor } from '@/app/lib/types';
import StatCard from './StatCard';

interface Props {
    doctor: Doctor | null;
    streak: ActivityStreak | null;
    pendingAppointments?: number;
}

const CAMPOS_CLAVE: (keyof Doctor)[] = ['name', 'specialty', 'city', 'whatsapp', 'profile_photo_url'];

export default function ResumenMedico({ doctor, streak, pendingAppointments = 0 }: Props) {
    const perfilIncompleto = !doctor || CAMPOS_CLAVE.some((campo) => !doctor[campo]);
    const racha = streak?.racha_actual ?? 0;
    const diasActivos = Math.min(streak?.dias_activos_esta_semana ?? 0, 3);

    return (
        <div className="flex flex-col gap-6">
            {perfilIncompleto && (
                <div className="flex items-center justify-between flex-wrap gap-3 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-4 py-3.5 rounded-xl">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Tu perfil aún está incompleto. Complétalo para que el admin pueda aprobarlo.</span>
                    </div>
                    <Link
                        href="/dashboard/perfil"
                        className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    >
                        Completar perfil
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {pendingAppointments > 0 && (
                <div className="flex items-center justify-between flex-wrap gap-3 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-3.5 rounded-xl">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                            Tienes {pendingAppointments} solicitud{pendingAppointments === 1 ? '' : 'es'} de cita
                            pendiente{pendingAppointments === 1 ? '' : 's'}.
                        </span>
                    </div>
                    <Link
                        href="/dashboard/citas"
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    >
                        Ver citas
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            <div>
                <h2 className="text-sm font-extrabold text-slate-800 mb-1">Resumen de tu perfil</h2>
                <p className="text-xs text-slate-500 max-w-2xl">
                    Estas cifras reflejan el interés que han mostrado los pacientes en tu perfil público y tu
                    actividad reciente en la plataforma.
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Visitas al perfil" value={doctor?.profile_views ?? 0} icon={Eye} color="blue" />
                <StatCard
                    label="Mensajes de contacto"
                    value={doctor?.appointment_clicks ?? 0}
                    icon={Mail}
                    color="emerald"
                />
                <StatCard
                    label="Contactos por WhatsApp"
                    value={doctor?.whatsapp_clicks ?? 0}
                    icon={MessageCircle}
                    color="amber"
                />
                <StatCard
                    label={`Racha · ${diasActivos}/3 días esta semana`}
                    value={`${racha} ${racha === 1 ? 'semana' : 'semanas'}`}
                    icon={Flame}
                    color="orange"
                />
            </div>
        </div>
    );
}

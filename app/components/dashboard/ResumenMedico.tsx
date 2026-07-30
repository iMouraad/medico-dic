import Link from 'next/link';
import { Eye, Mail, MessageCircle, ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import type { Doctor } from '@/app/lib/types';

interface Props {
    doctor: Doctor | null;
    pendingAppointments?: number;
}

const CAMPOS_CLAVE: (keyof Doctor)[] = ['name', 'specialty', 'city', 'whatsapp', 'profile_photo_url'];

export default function ResumenMedico({ doctor, pendingAppointments = 0 }: Props) {
    const perfilIncompleto = !doctor || CAMPOS_CLAVE.some((campo) => !doctor[campo]);

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
                        className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        Completar perfil
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            <div>
                <h2 className="text-sm font-extrabold text-slate-800 mb-1">Resumen de tu perfil</h2>
                <p className="text-xs text-slate-500 max-w-2xl">
                    Estas cifras reflejan el interés que han mostrado los pacientes en tu perfil público desde que
                    se publicó.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Visitas al perfil', value: doctor?.profile_views ?? 0, icon: Eye, className: 'text-blue-600 bg-blue-50' },
                    { label: 'Solicitudes de cita', value: doctor?.appointment_clicks ?? 0, icon: Mail, className: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Contactos por WhatsApp', value: doctor?.whatsapp_clicks ?? 0, icon: MessageCircle, className: 'text-amber-600 bg-amber-50' },
                ].map(({ label, value, icon: Icon, className }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-2xl font-black text-slate-800 leading-none">{value}</div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

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
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                        Ver citas
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}
        </div>
    );
}

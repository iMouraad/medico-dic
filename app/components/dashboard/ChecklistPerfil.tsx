import Link from 'next/link';
import { Check, Circle } from 'lucide-react';
import type { Doctor } from '@/app/lib/types';

export default function ChecklistPerfil({ doctor }: { doctor: Doctor | null }) {
    if (!doctor) return null;

    const items = [
        { label: 'Foto de perfil', done: !!doctor.profile_photo_url },
        { label: 'Nombre completo', done: !!doctor.name },
        { label: 'Especialidad', done: !!doctor.specialty },
        { label: 'Ciudad', done: !!doctor.city },
        { label: 'WhatsApp', done: !!doctor.whatsapp },
        { label: 'Biografía', done: !!doctor.bio },
        { label: 'Ubicación en el mapa', done: doctor.latitude != null && doctor.longitude != null },
        { label: 'Galería de fotos', done: (doctor.galeria_urls?.length ?? 0) > 0 },
    ];
    const completados = items.filter((i) => i.done).length;
    const porcentaje = Math.round((completados / items.length) * 100);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progreso de tu perfil</h2>
                <span className={`text-xs font-black ${porcentaje === 100 ? 'text-emerald-600' : 'text-brand-turquoise'}`}>
                    {porcentaje}%
                </span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                    className={`h-full rounded-full transition-all ${porcentaje === 100 ? 'bg-emerald-500' : 'bg-brand-turquoise'}`}
                    style={{ width: `${porcentaje}%` }}
                />
            </div>

            <div className="flex flex-col gap-2 mb-3">
                {items.map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                        {done ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                        )}
                        <span className={done ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-600 font-semibold'}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {porcentaje < 100 && (
                <Link
                    href="/dashboard/perfil"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-turquoise hover:text-brand-blue transition-colors"
                >
                    Completar perfil →
                </Link>
            )}
        </div>
    );
}

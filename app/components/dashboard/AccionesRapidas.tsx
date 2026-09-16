import Link from 'next/link';
import { UserCog, Clock, Mail, ExternalLink } from 'lucide-react';
import type { Doctor } from '@/app/lib/types';

export default function AccionesRapidas({ doctor }: { doctor: Doctor | null }) {
    const acciones = [
        { href: '/dashboard/perfil', label: 'Editar mi perfil', icon: UserCog },
        { href: '/dashboard/horario', label: 'Configurar horario', icon: Clock },
        { href: '/dashboard/mensajes', label: 'Ver mensajes', icon: Mail },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Acciones rápidas</h2>
            <div className="flex flex-col gap-1.5">
                {acciones.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                    </Link>
                ))}
                {doctor?.status === 'aprobado' && (
                    <Link
                        href={`/medicos/${doctor.id}`}
                        target="_blank"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-turquoise hover:bg-brand-turquoise/5 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        Ver mi perfil público
                    </Link>
                )}
            </div>
        </div>
    );
}

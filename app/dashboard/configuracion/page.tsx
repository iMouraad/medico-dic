import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserCog, Clock, Bell, ShieldCheck, ChevronRight } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/server';
import PageHeader from '@/app/components/PageHeader';

const TARJETAS = [
    {
        href: '/dashboard/perfil',
        icon: UserCog,
        title: 'Mi perfil público',
        description: 'Datos básicos, ubicación en el mapa, consulta, galería de fotos y descuentos.',
        disponible: true,
    },
    {
        href: '/dashboard/horario',
        icon: Clock,
        title: 'Horario de atención',
        description: 'Días y horas en que atiendes, y los días que bloqueas por vacaciones o imprevistos.',
        disponible: true,
    },
    {
        href: '#',
        icon: Bell,
        title: 'Notificaciones',
        description: 'Elige cómo quieres enterarte de mensajes y citas nuevas.',
        disponible: false,
    },
    {
        href: '#',
        icon: ShieldCheck,
        title: 'Cuenta y seguridad',
        description: 'Cambiar tu contraseña y el correo con el que inicias sesión.',
        disponible: false,
    },
];

export default async function ConfiguracionPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Configuración"
                description="Todo lo que necesitas ajustar en tu cuenta, en un solo lugar. Elige qué quieres configurar."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {TARJETAS.map(({ href, icon: Icon, title, description, disponible }) =>
                    disponible ? (
                        <Link
                            key={title}
                            href={href}
                            className="group bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col gap-3 hover:border-blue-200 hover:shadow-md transition-all"
                        >
                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-sm font-extrabold text-slate-800 mb-1">{title}</h2>
                                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-1.5 transition-all">
                                Ir a configurar
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        </Link>
                    ) : (
                        <div
                            key={title}
                            className="bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 flex flex-col gap-3 opacity-70"
                        >
                            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-sm font-extrabold text-slate-500 mb-1">{title}</h2>
                                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
                            </div>
                            <span className="inline-flex w-fit items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                                Próximamente
                            </span>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

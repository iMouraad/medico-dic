'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, UserCircle2, LayoutDashboard, Calendar, Stethoscope, Mail, Megaphone, Settings, Users, Tag } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

// Los ítems de uso diario (operar la agenda) van sueltos en el sidebar; todo
// lo que es "configurar mi cuenta una vez y volver de vez en cuando" (perfil
// público, horario, y lo que se agregue después) vive detrás de un solo
// ítem "Configuración" para no llenar el sidebar de secciones que no se
// visitan todos los días.
const NAV_ITEMS_BY_ROLE = {
    medico: [
        { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
        { href: '/dashboard/citas', label: 'Mis citas', icon: Calendar },
        { href: '/dashboard/pacientes', label: 'Pacientes', icon: Users },
        { href: '/dashboard/mensajes', label: 'Mensajes', icon: Mail },
        { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings, matchPrefixes: ['/dashboard/configuracion', '/dashboard/perfil', '/dashboard/horario'] },
    ],
    admin: [
        { href: '/admin', label: 'Médicos', icon: Stethoscope },
        { href: '/admin/especialidades', label: 'Especialidades', icon: Tag },
        { href: '/admin/anuncios', label: 'Anuncios', icon: Megaphone },
    ],
} as const;

interface Props {
    role: 'medico' | 'admin';
    title: string;
    displayName: string;
    avatarUrl: string | null;
    children: React.ReactNode;
}

export default function PanelShell({ role, title, displayName, avatarUrl, children }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const items = NAV_ITEMS_BY_ROLE[role];

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const userInfo = (
        <div className="flex items-center gap-2.5 px-2 py-1.5 min-w-0">
            {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
                <UserCircle2 className="w-8 h-8 text-slate-300 flex-shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-700 uppercase truncate">{displayName}</span>
        </div>
    );

    const sidebarBody = (
        <>
            <div className="p-5 border-b border-blue-200/70">
                <Link href="/" className="flex items-center gap-2.5">
                    <img src="/logo.jpg" alt="NEOSDOC" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                    <span className="text-lg font-extrabold text-slate-800 tracking-tight">
                        NEOS<span className="text-blue-600">DOC</span>
                    </span>
                </Link>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3">{title}</p>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                {items.map((item) => {
                    const { href, label, icon: Icon } = item;
                    const prefixes = 'matchPrefixes' in item ? item.matchPrefixes : undefined;
                    const active = prefixes ? prefixes.some((p) => pathname.startsWith(p)) : pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setDrawerOpen(false)}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                active
                                    ? 'bg-white text-blue-700 shadow-xs'
                                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-800'
                            }`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-blue-200/70 flex flex-col gap-2">
                {role === 'medico' ? (
                    <Link
                        href="/dashboard/perfil"
                        onClick={() => setDrawerOpen(false)}
                        className="rounded-xl hover:bg-white/70 transition-colors cursor-pointer"
                    >
                        {userInfo}
                    </Link>
                ) : (
                    userInfo
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100/60 transition-colors cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar de escritorio */}
            <aside className="hidden md:flex flex-col w-64 bg-blue-100/70 border-r border-blue-200/70 h-screen sticky top-0 flex-shrink-0">
                {sidebarBody}
            </aside>

            {/* Drawer móvil */}
            {drawerOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <aside className="relative flex flex-col w-64 bg-blue-100/95 backdrop-blur-sm h-full shadow-xl">
                        <button
                            onClick={() => setDrawerOpen(false)}
                            aria-label="Cerrar menú"
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {sidebarBody}
                    </aside>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar móvil */}
                <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.jpg" alt="NEOSDOC" className="w-7 h-7 rounded-lg object-cover" />
                        <span className="text-sm font-extrabold text-slate-800">
                            NEOS<span className="text-blue-600">DOC</span>
                        </span>
                    </Link>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Abrir menú"
                        className="p-2 text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <main className="flex-1 w-full">{children}</main>
            </div>
        </div>
    );
}

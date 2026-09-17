'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { User, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

const navLinkClasses = (active: boolean) =>
    `text-sm font-semibold py-5 transition-colors ${
        active
            ? 'text-blue-600 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-blue-600 after:rounded-t-full'
            : 'text-slate-500 hover:text-slate-800'
    }`;

export default function Header() {
    const pathname = usePathname();
    const [panelHref, setPanelHref] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();

        const resolveSession = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setPanelHref(null);
                setAvatarUrl(null);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const isAdmin = profile?.role === 'admin';
            setPanelHref(isAdmin ? '/admin/panel' : '/dashboard');

            if (isAdmin) {
                setAvatarUrl(null);
                return;
            }

            const { data: doctor } = await supabase
                .from('doctors')
                .select('profile_photo_url')
                .eq('user_id', user.id)
                .maybeSingle();

            setAvatarUrl(doctor?.profile_photo_url ?? null);
        };

        resolveSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => resolveSession());

        return () => subscription.unsubscribe();
    }, []);

    return (
        <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-[1000] shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <img
                        src="/logo.jpg"
                        alt="NEOSDOC"
                        className="w-9 h-9 rounded-xl object-cover shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="text-xl font-extrabold tracking-tight text-slate-800">
                        NEOS<span className="text-blue-600">DOC</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className={navLinkClasses(pathname === '/')}>
                        Inicio
                    </Link>
                    <Link href="/medicos" className={navLinkClasses(pathname === '/medicos')}>
                        Médicos
                    </Link>
                    <Link href="/clinicas" className={navLinkClasses(pathname === '/clinicas')}>
                        Clínicas
                    </Link>
                    <Link href="#socios" className={navLinkClasses(false)}>
                        Socios comerciales
                    </Link>
                </nav>

                {/* Botón de la derecha */}
                {panelHref ? (
                    <Link
                        href={panelHref}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-200 shadow-sm shadow-blue-500/10 hover:shadow-md hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer"
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Mi perfil"
                                className="w-5 h-5 rounded-full object-cover border border-white/40"
                            />
                        ) : (
                            <UserCircle2 className="w-4 h-4" />
                        )}
                        <span>Mi perfil</span>
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-200 shadow-sm shadow-blue-500/10 hover:shadow-md hover:shadow-blue-500/25 active:scale-[0.98] cursor-pointer"
                    >
                        <User className="w-4 h-4" />
                        <span>Registrarse / Login</span>
                    </Link>
                )}
            </div>
        </header>
    );
}

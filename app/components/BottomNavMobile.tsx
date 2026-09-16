'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MapPin, Stethoscope } from 'lucide-react';

const ITEMS = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/medicos', label: 'Médicos', icon: Stethoscope },
    { href: '/favoritos', label: 'Favoritos', icon: Heart },
    { href: '/mapa', label: 'Mapa', icon: MapPin },
];

// Bottom nav solo para móvil (md:hidden). No incluye "Perfil": el paciente
// no tiene registro/login en NeosDoc — ver NeosDoc_Especificacion_Menu_
// Filtros_Tarjeta, sección 1.1.
export default function BottomNavMobile() {
    const pathname = usePathname();

    return (
        <nav
            className="md:hidden fixed bottom-0 inset-x-0 z-[1000] bg-white border-t border-slate-100 flex items-stretch"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {ITEMS.map(({ href, label, icon: Icon }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors ${
                            active ? 'text-brand-turquoise' : 'text-slate-400'
                        }`}
                    >
                        <Icon className={`w-5 h-5 ${active ? 'fill-brand-turquoise/15' : ''}`} />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

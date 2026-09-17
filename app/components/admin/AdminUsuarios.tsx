'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck, Stethoscope, Search } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

interface Usuario {
    id: string;
    role: 'medico' | 'admin';
    created_at: string;
    email: string | null;
    name: string | null;
    username: string | null;
}

const ROLE_BADGE: Record<Usuario['role'], string> = {
    admin: 'bg-brand-blue-dark/10 text-brand-blue-dark border-brand-blue-dark/20',
    medico: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function AdminUsuarios({ usuarios: initial }: { usuarios: Usuario[] }) {
    const [usuarios, setUsuarios] = useState(initial);
    const [query, setQuery] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const filtrados = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return usuarios;
        return usuarios.filter((u) =>
            [u.name, u.email, u.username].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
        );
    }, [usuarios, query]);

    const cambiarRol = async (usuario: Usuario, nuevoRol: Usuario['role']) => {
        if (nuevoRol === 'medico') {
            const confirmar = window.confirm(
                `¿Quitarle el rol de administrador a ${usuario.name || usuario.email}? Perderá acceso al panel de admin.`
            );
            if (!confirmar) return;
        }

        setLoadingId(usuario.id);
        const supabase = createClient();
        const { error } = await supabase.from('profiles').update({ role: nuevoRol }).eq('id', usuario.id);
        setLoadingId(null);

        if (!error) {
            setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, role: nuevoRol } : u)));
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar usuario..."
                    className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                {filtrados.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-400 font-medium">No hay usuarios.</div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtrados.map((usuario) => (
                            <div key={usuario.id} className="flex items-center justify-between gap-4 p-4 flex-wrap">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-bold text-slate-800 truncate">
                                            {usuario.name || usuario.email || 'Sin nombre'}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${ROLE_BADGE[usuario.role]}`}>
                                            {usuario.role === 'admin' ? (
                                                <ShieldCheck className="w-3 h-3" />
                                            ) : (
                                                <Stethoscope className="w-3 h-3" />
                                            )}
                                            {usuario.role}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {usuario.email}
                                        {usuario.username && <span className="text-slate-400"> · @{usuario.username}</span>}
                                        <span className="text-slate-400"> · registrado el {new Date(usuario.created_at).toLocaleDateString('es-EC')}</span>
                                    </span>
                                </div>

                                <button
                                    onClick={() => cambiarRol(usuario, usuario.role === 'admin' ? 'medico' : 'admin')}
                                    disabled={loadingId === usuario.id}
                                    className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
                                        usuario.role === 'admin'
                                            ? 'text-red-600 bg-red-50 hover:bg-red-100/80 border-red-100'
                                            : 'text-brand-blue-dark bg-brand-blue-dark/5 hover:bg-brand-blue-dark/10 border-brand-blue-dark/15'
                                    }`}
                                >
                                    {loadingId === usuario.id
                                        ? 'Guardando...'
                                        : usuario.role === 'admin'
                                        ? 'Quitar admin'
                                        : 'Hacer admin'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

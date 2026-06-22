'use client';

import { useState } from 'react';
import TarjetaMedico from './TarjetaMedico';
import Buscador from './Buscador';
import { Search } from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    consultation_price: number;
    whatsapp: string;
    plan: string;
    profile_photo_url: string;
    modalities: string[];
    verified_senescyt: boolean;
}

export default function ListaMedicos({ doctors }: { doctors: Doctor[] }) {
    const [filtered, setFiltered] = useState(doctors);

    return (
        <div>
            <Buscador doctors={doctors} onFilter={setFiltered} />
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filtered.map((doctor) => (
                        <TarjetaMedico key={doctor.id} doctor={doctor} />
                    ))}
                </div>
            ) : (
                <div className="bg-white/50 backdrop-blur-md border border-slate-100/80 rounded-2xl p-12 text-center shadow-sm mt-6 flex flex-col items-center justify-center">
                    <div className="p-3 bg-slate-100/60 rounded-full text-slate-400 mb-3">
                        <Search className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">Sin resultados</h3>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        No encontramos médicos que coincidan con la búsqueda. Intenta limpiar los filtros y buscar con otros términos.
                    </p>
                </div>
            )}
        </div>
    );
}
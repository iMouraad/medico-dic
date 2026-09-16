'use client';

import { Baby, HeartPulse, Sparkles, ChevronRight } from 'lucide-react';

const DESTACADAS = [
    {
        name: 'Odontología',
        bg: 'bg-cyan-50 hover:bg-cyan-100/70',
        text: 'text-cyan-600',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                <path
                    d="M12 3c-2 0-3.2 1.1-4.2 1.1C6.5 4.1 5 3 3.6 4.4 2.3 5.7 2.3 8 3 10c.7 2 1.3 3 1.8 5.3.4 1.9.7 5.2 2.2 5.2 1.7 0 1.7-4 2-5.3.3-1.2.6-2 1-2s.7.8 1 2c.3 1.3.3 5.3 2 5.3 1.5 0 1.8-3.3 2.2-5.2.5-2.3 1.1-3.3 1.8-5.3.7-2 .7-4.3-.6-5.6C15 3 13.5 4.1 12 4.1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        name: 'Pediatría',
        bg: 'bg-purple-50 hover:bg-purple-100/70',
        text: 'text-purple-600',
        icon: <Baby className="w-7 h-7" />,
    },
    {
        name: 'Dermatología',
        bg: 'bg-emerald-50 hover:bg-emerald-100/70',
        text: 'text-emerald-600',
        icon: <Sparkles className="w-7 h-7" />,
    },
    {
        name: 'Cardiología',
        bg: 'bg-red-50 hover:bg-red-100/70',
        text: 'text-red-500',
        icon: <HeartPulse className="w-7 h-7" />,
    },
];

interface Props {
    onSelect: (especialidad: string) => void;
    onVerTodas: () => void;
}

export default function EspecialidadesDestacadas({ onSelect, onVerTodas }: Props) {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold text-brand-blue-dark">Especialidades destacadas</h2>
                <button
                    type="button"
                    onClick={onVerTodas}
                    className="inline-flex items-center gap-0.5 text-xs font-bold text-brand-turquoise hover:text-brand-blue transition-colors cursor-pointer"
                >
                    Ver todas
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DESTACADAS.map(({ name, bg, text, icon }) => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onSelect(name)}
                        className={`${bg} rounded-3xl p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer`}
                    >
                        <span className={text}>{icon}</span>
                        <span className="text-xs font-bold text-slate-700 text-center">{name}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}

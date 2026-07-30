import { Search, Link2, Gift, Building2 } from 'lucide-react';

const PASOS = [
    {
        icon: Search,
        title: 'Busca o regístrate',
        text: 'Según seas paciente o médico',
    },
    {
        icon: Link2,
        title: 'Conecta',
        text: 'El paciente encuentra al médico ideal; el médico gana visibilidad',
    },
    {
        icon: Gift,
        title: 'Accede a beneficios',
        text: 'Descuentos para pacientes, ofertas para médicos',
    },
    {
        icon: Building2,
        title: 'Socios comerciales',
        text: 'Llegan a esa red de forma directa y transparente',
    },
];

export default function ComoFunciona() {
    return (
        <section id="como-funciona" className="w-full py-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>Cómo funciona</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {PASOS.map((paso, idx) => {
                    const Icon = paso.icon;
                    return (
                        <div
                            key={paso.title}
                            className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-black text-slate-100">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-800">{paso.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{paso.text}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

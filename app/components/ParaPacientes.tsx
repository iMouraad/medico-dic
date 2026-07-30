import { HeartHandshake, CheckCircle2 } from 'lucide-react';

const PUNTOS = [
    'Búsqueda gratuita, sin registro obligatorio',
    'Médicos verificados por especialidad',
    'Posibles descuentos exclusivos NEOSDOC',
];

export default function ParaPacientes() {
    return (
        <section id="pacientes" className="w-full py-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4 text-blue-600" />
                <span>Para pacientes</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-3">
                        Encuentra a tu médico, sin complicaciones
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                        Busca por especialidad y ubicación, revisa el perfil del médico y agenda tu cita.
                        Algunos médicos ofrecen un descuento especial a pacientes que llegan a través de NEOSDOC.
                    </p>
                </div>

                <ul className="flex flex-col gap-3 w-full md:w-auto md:min-w-[280px]">
                    {PUNTOS.map((punto) => (
                        <li key={punto} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>{punto}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

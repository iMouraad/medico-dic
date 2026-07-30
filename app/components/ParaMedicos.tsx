import Link from 'next/link';
import { Stethoscope, CheckCircle2, ArrowRight } from 'lucide-react';

const PUNTOS = [
    'Perfil profesional sin costo, sin letra pequeña',
    'Exposición ante pacientes que buscan tu especialidad',
    'Reportes periódicos de tendencias de tu especialidad',
    'Ofertas y beneficios de proveedores del sector salud, solo si tú lo autorizas',
];

export default function ParaMedicos() {
    return (
        <section id="para-medicos" className="w-full py-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Para médicos</span>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-lg shadow-blue-900/10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8 text-white">
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-extrabold mb-3">
                        Tu perfil, 100% gratis. Siempre.
                    </h2>
                    <p className="text-sm text-blue-100 leading-relaxed max-w-xl mb-6">
                        A diferencia de otros directorios médicos, en NEOSDOC tu presencia digital nunca tiene costo.
                        Ganas visibilidad ante pacientes reales y acceso a beneficios y ofertas de proveedores del
                        sector salud, sin que compartamos tu contacto directo con nadie.
                    </p>
                    <Link
                        href="/registro"
                        className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 cursor-pointer active:scale-98 shadow-sm"
                    >
                        Crea tu perfil gratis
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <ul className="flex flex-col gap-3 w-full md:w-auto md:min-w-[300px]">
                    {PUNTOS.map((punto) => (
                        <li key={punto} className="flex items-start gap-2.5 text-sm text-blue-50 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                            <span>{punto}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

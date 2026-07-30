import { Building2, CheckCircle2 } from 'lucide-react';

const PUNTOS = [
    'Audiencia médica segmentada por especialidad y ubicación',
    'Modelos flexibles: tarifa fija o comisión por venta, según tu producto',
    'Gestión de la comunicación a cargo de NEOSDOC (cumplimiento LOPDP)',
];

export default function ParaSocios() {
    return (
        <section id="socios" className="w-full py-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Para socios comerciales</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-3">
                        Llega a médicos reales, sin outreach uno por uno
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-xl mb-6">
                        NEOSDOC conecta a tu marca con un cuerpo médico segmentado y con consentimiento, a través de
                        un solo canal. Nosotros gestionamos el contacto: tú accedes a la audiencia sin construir una
                        base de datos desde cero.
                    </p>
                    <a
                        href="mailto:contacto@neosdoc.ec?subject=Quiero%20conocer%20m%C3%A1s%20sobre%20NEOSDOC"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-750 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
                    >
                        Quiero conocer más
                    </a>
                </div>

                <ul className="flex flex-col gap-3 w-full md:w-auto md:min-w-[300px]">
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

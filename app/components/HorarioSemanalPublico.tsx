import { DIAS_SEMANA_KEYS, DIAS_SEMANA_LABEL, type HorarioAtencion } from '@/app/lib/types';
import { getDiaSemana } from '@/app/lib/horarioAtencion';

export default function HorarioSemanalPublico({ horario }: { horario: HorarioAtencion }) {
    const hoy = getDiaSemana(new Date());

    return (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DIAS_SEMANA_KEYS.map((dia) => {
                const config = horario[dia];
                const esHoy = dia === hoy;
                return (
                    <div
                        key={dia}
                        className={`rounded-xl border px-2 py-3 text-center ${
                            esHoy
                                ? 'bg-available-green/10 border-available-green'
                                : 'bg-white border-slate-100'
                        }`}
                    >
                        <div
                            className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${
                                esHoy ? 'text-available-green' : 'text-brand-blue-dark'
                            }`}
                        >
                            {DIAS_SEMANA_LABEL[dia].slice(0, 3)}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                            {config?.activo ? `${config.inicio} - ${config.fin}` : 'Cerrado'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

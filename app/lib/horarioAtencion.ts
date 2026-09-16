import { DIAS_SEMANA_LABEL, type DiaSemana, type HorarioAtencion } from './types';

const JS_DAY_TO_KEY: DiaSemana[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export function getDiaSemana(date: Date): DiaSemana {
    return JS_DAY_TO_KEY[date.getDay()];
}

export function toISODateOnly(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getHorarioWarning(
    horario: HorarioAtencion,
    diasBloqueados: string[],
    startISO: string,
    durationMinutes: number
): string | null {
    const start = new Date(startISO);

    if (diasBloqueados.includes(toISODateOnly(start))) {
        return 'Ese día está marcado como no disponible (bloqueado).';
    }

    const dia = getDiaSemana(start);
    const config = horario[dia];

    if (!config || !config.activo) {
        return `No atiendes los ${DIAS_SEMANA_LABEL[dia].toLowerCase()}.`;
    }

    const end = new Date(start.getTime() + durationMinutes * 60000);
    const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const inicioMin = Math.round((start.getTime() - startOfDay.getTime()) / 60000);
    const finMin = Math.round((end.getTime() - startOfDay.getTime()) / 60000);

    const [hi, mi] = config.inicio.split(':').map(Number);
    const [hf, mf] = config.fin.split(':').map(Number);
    const horarioInicioMin = hi * 60 + mi;
    const horarioFinMin = hf * 60 + mf;

    if (inicioMin < horarioInicioMin || finMin > horarioFinMin) {
        return `Fuera de tu horario de atención (${config.inicio}–${config.fin}).`;
    }

    return null;
}

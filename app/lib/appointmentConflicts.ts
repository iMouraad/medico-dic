import type { Appointment } from './types';

export const DURACIONES_DISPONIBLES = [15, 20, 30, 45, 60, 90, 120];

export function getConflicts(
    appointments: Appointment[],
    startISO: string,
    durationMinutes: number,
    excludeId?: number
): Appointment[] {
    const start = new Date(startISO).getTime();
    const end = start + durationMinutes * 60000;

    return appointments.filter((a) => {
        if (a.id === excludeId) return false;
        if (a.status === 'cancelada') return false;
        const aStart = new Date(a.preferred_at).getTime();
        const aEnd = aStart + (a.duration_minutes ?? 30) * 60000;
        return start < aEnd && aStart < end;
    });
}

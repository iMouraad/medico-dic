'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, CheckCircle2, Clock, Mail, Phone, Calendar, Plus, GripVertical, AlertTriangle } from 'lucide-react';
import { HORARIO_ATENCION_DEFAULT, APPOINTMENT_STATUS_LABEL, type Appointment, type HorarioAtencion } from '@/app/lib/types';
import { getConflicts } from '@/app/lib/appointmentConflicts';
import { getHorarioWarning } from '@/app/lib/horarioAtencion';
import { formatHora, formatFechaLarga } from '@/app/lib/dateFormat';

interface Props {
    appointments: Appointment[];
    horario?: HorarioAtencion;
    diasBloqueados?: string[];
    onConfirmar: (id: number) => void;
    onCancelar: (id: number) => void;
    onCompletar: (id: number) => void;
    onReprogramar: (id: number, isoDate: string) => void;
    onCrearEnFecha?: (fechaISO: string) => void;
}

interface Warnings {
    conflicts: Appointment[];
    horario: string | null;
}

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const STATUS_DOT: Record<Appointment['status'], string> = {
    pendiente: 'bg-amber-500',
    confirmada: 'bg-blue-500',
    completada: 'bg-emerald-500',
    cancelada: 'bg-red-400',
};

const STATUS_CHIP: Record<Appointment['status'], string> = {
    pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmada: 'bg-blue-50 text-blue-700 border-blue-200',
    completada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelada: 'bg-red-50 text-red-700 border-red-200 line-through opacity-70',
};

const MAX_CHIPS_VISIBLE = 3;
const DRAG_MIME = 'application/x-appointment-id';

function toDateKey(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function toISODate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatRango(a: Appointment) {
    const start = new Date(a.preferred_at);
    const end = new Date(start.getTime() + (a.duration_minutes ?? 30) * 60000);
    return `${formatHora(start)}–${formatHora(end)}`;
}

export default function CalendarioCitas({
    appointments,
    horario = HORARIO_ATENCION_DEFAULT,
    diasBloqueados = [],
    onConfirmar,
    onCancelar,
    onCompletar,
    onReprogramar,
    onCrearEnFecha,
}: Props) {
    const [cursor, setCursor] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [reprogramando, setReprogramando] = useState<number | null>(null);
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [reprogramarWarnings, setReprogramarWarnings] = useState<Warnings | null>(null);
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [dragConflictMsg, setDragConflictMsg] = useState<string | null>(null);

    const appointmentsByDay = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        for (const a of appointments) {
            const key = toDateKey(a.preferred_at);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(a);
        }
        for (const list of map.values()) {
            list.sort((x, y) => new Date(x.preferred_at).getTime() - new Date(y.preferred_at).getTime());
        }
        return map;
    }, [appointments]);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const cells = useMemo(() => {
        const firstOfMonth = new Date(year, month, 1);
        const jsDay = firstOfMonth.getDay(); // 0=Dom..6=Sáb
        const offset = (jsDay + 6) % 7; // 0 = Lunes
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

        return Array.from({ length: totalCells }, (_, i) => {
            const dayNumber = i - offset + 1;
            const date = new Date(year, month, dayNumber);
            const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            return { date, inMonth, key, appts: appointmentsByDay.get(key) ?? [] };
        });
    }, [year, month, appointmentsByDay]);

    const hoyKey = toDateKey(new Date().toISOString());
    const seleccionados = selectedDay ? appointmentsByDay.get(selectedDay) ?? [] : [];
    const selectedDate = cells.find((c) => c.key === selectedDay)?.date ?? null;

    const handleReprogramar = (id: number) => {
        if (!nuevaFecha) return;
        const original = appointments.find((a) => a.id === id);
        const duration = original?.duration_minutes ?? 30;
        const startISO = new Date(nuevaFecha).toISOString();

        if (!reprogramarWarnings) {
            const encontrados = getConflicts(appointments, startISO, duration, id);
            const avisoHorario = getHorarioWarning(horario, diasBloqueados, startISO, duration);
            if (encontrados.length > 0 || avisoHorario) {
                setReprogramarWarnings({ conflicts: encontrados, horario: avisoHorario });
                return;
            }
        }

        onReprogramar(id, startISO);
        setReprogramando(null);
        setNuevaFecha('');
        setReprogramarWarnings(null);
    };

    const moverACelda = (appointmentId: number, targetDate: Date) => {
        const original = appointments.find((a) => a.id === appointmentId);
        if (!original) return;
        const origDate = new Date(original.preferred_at);
        if (toDateKey(original.preferred_at) === toDateKey(targetDate.toISOString())) return;
        const nueva = new Date(targetDate);
        nueva.setHours(origDate.getHours(), origDate.getMinutes(), 0, 0);

        const encontrados = getConflicts(appointments, nueva.toISOString(), original.duration_minutes, appointmentId);
        if (encontrados.length > 0) {
            setDragConflictMsg(
                `No se movió "${original.patient_name}": ese horario ya lo ocupa ${encontrados[0].patient_name} (${formatHora(
                    new Date(encontrados[0].preferred_at)
                )}). Ábrelo y usa "Aplazar" si quieres forzarlo igual.`
            );
            return;
        }

        const avisoHorario = getHorarioWarning(horario, diasBloqueados, nueva.toISOString(), original.duration_minutes);
        if (avisoHorario) {
            setDragConflictMsg(
                `No se movió "${original.patient_name}": ${avisoHorario[0].toLowerCase()}${avisoHorario.slice(1)} Ábrelo y usa "Aplazar" si quieres forzarlo igual.`
            );
            return;
        }

        setDragConflictMsg(null);
        onReprogramar(appointmentId, nueva.toISOString());
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 flex flex-col gap-4">
            {dragConflictMsg && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{dragConflictMsg}</span>
                    <button
                        onClick={() => setDragConflictMsg(null)}
                        aria-label="Cerrar aviso"
                        className="text-amber-500 hover:text-amber-700 cursor-pointer flex-shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-50">
                    <button
                        onClick={() => setCursor(new Date(year, month - 1, 1))}
                        aria-label="Mes anterior"
                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-extrabold text-slate-800">
                            {MESES[month]} {year}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Haz clic en un día para agendar · arrastra una cita para aplazarla
                        </span>
                    </div>
                    <button
                        onClick={() => setCursor(new Date(year, month + 1, 1))}
                        aria-label="Mes siguiente"
                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-7 border-b border-slate-50">
                    {DIAS_SEMANA.map((d) => (
                        <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {cells.map(({ date, inMonth, key, appts }) => {
                        const visibles = appts.slice(0, MAX_CHIPS_VISIBLE);
                        const restantes = appts.length - visibles.length;
                        const isDragOver = dragOverKey === key;

                        return (
                            <div
                                key={key}
                                onClick={() => {
                                    if (inMonth && onCrearEnFecha) onCrearEnFecha(toISODate(date));
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOverKey(key);
                                }}
                                onDragLeave={() => setDragOverKey((prev) => (prev === key ? null : prev))}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverKey(null);
                                    const idStr = e.dataTransfer.getData(DRAG_MIME);
                                    if (idStr) moverACelda(Number(idStr), date);
                                    setDraggingId(null);
                                }}
                                className={`group min-h-[92px] p-1.5 border-b border-r border-slate-50 flex flex-col items-stretch gap-1 text-left transition-colors cursor-pointer ${
                                    inMonth ? 'bg-white' : 'bg-slate-50/40'
                                } ${isDragOver ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : ''} ${
                                    selectedDay === key && !isDragOver ? 'ring-2 ring-inset ring-blue-500' : ''
                                } hover:bg-blue-50/30`}
                            >
                                <span
                                    className={`text-[11px] font-bold ${
                                        key === hoyKey
                                            ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center'
                                            : inMonth
                                              ? 'text-slate-600'
                                              : 'text-slate-300'
                                    }`}
                                >
                                    {date.getDate()}
                                </span>

                                <div className="flex flex-col gap-0.5">
                                    {visibles.map((a) => (
                                        <div
                                            key={a.id}
                                            draggable={a.status !== 'cancelada' && a.status !== 'completada'}
                                            onDragStart={(e) => {
                                                e.stopPropagation();
                                                e.dataTransfer.setData(DRAG_MIME, String(a.id));
                                                e.dataTransfer.effectAllowed = 'move';
                                                setDraggingId(a.id);
                                            }}
                                            onDragEnd={() => setDraggingId(null)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDay(key);
                                            }}
                                            title={`${a.patient_name} · ${formatRango(a)}`}
                                            className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-1 rounded-md border truncate ${STATUS_CHIP[a.status]} ${
                                                a.status !== 'cancelada' && a.status !== 'completada' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                                            } ${draggingId === a.id ? 'opacity-40' : ''}`}
                                        >
                                            {a.status !== 'cancelada' && a.status !== 'completada' && (
                                                <GripVertical className="w-2.5 h-2.5 flex-shrink-0 opacity-50" />
                                            )}
                                            <span className="truncate">
                                                {formatRango(a)} {a.patient_name}
                                            </span>
                                        </div>
                                    ))}
                                    {restantes > 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDay(key);
                                            }}
                                            className="text-[9px] font-bold text-slate-400 hover:text-blue-600 px-1.5 text-left cursor-pointer"
                                        >
                                            +{restantes} más
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-4 px-1 flex-wrap">
                {(Object.keys(STATUS_DOT) as Appointment['status'][]).map((status) => (
                    <span key={status} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                        {APPOINTMENT_STATUS_LABEL[status].label}
                    </span>
                ))}
            </div>
        </div>

        <div className="xl:col-span-1 xl:sticky xl:top-6 flex flex-col gap-4">
            {!selectedDay ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-8 flex flex-col items-center text-center gap-2">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Selecciona un día</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Haz clic en cualquier día del calendario para ver sus citas o registrar una nueva.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-50">
                        <span className="text-xs font-extrabold text-slate-800">
                            {selectedDate && formatFechaLarga(selectedDate)}
                        </span>
                        <div className="flex items-center gap-3">
                            {onCrearEnFecha && selectedDate && (
                                <button
                                    onClick={() => onCrearEnFecha(toISODate(selectedDate))}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Registrar cita
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>

                    {seleccionados.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 font-medium">
                            No hay citas registradas este día.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {seleccionados.map((a) => (
                                <div key={a.id} className="flex flex-col gap-3 p-4">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-slate-800">{a.patient_name}</span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${APPOINTMENT_STATUS_LABEL[a.status].className}`}
                                                >
                                                    {APPOINTMENT_STATUS_LABEL[a.status].label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatRango(a)}
                                                </span>
                                                {a.patient_cedula && (
                                                    <span className="font-bold text-slate-600">Cédula: {a.patient_cedula}</span>
                                                )}
                                                {a.patient_email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {a.patient_email}
                                                    </span>
                                                )}
                                                {a.patient_phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {a.patient_phone}
                                                    </span>
                                                )}
                                            </div>
                                            {a.reason && <p className="text-xs text-slate-500 mt-1.5">{a.reason}</p>}
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {a.status !== 'confirmada' && a.status !== 'completada' && (
                                                <button
                                                    onClick={() => onConfirmar(a.id)}
                                                    aria-label="Confirmar"
                                                    className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-100 cursor-pointer"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {a.status === 'confirmada' && (
                                                <button
                                                    onClick={() => onCompletar(a.id)}
                                                    aria-label="Marcar completada"
                                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100/80 rounded-lg border border-blue-100 cursor-pointer"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {a.status !== 'cancelada' && a.status !== 'completada' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setReprogramando(reprogramando === a.id ? null : a.id);
                                                            setNuevaFecha('');
                                                            setReprogramarWarnings(null);
                                                        }}
                                                        aria-label="Aplazar / reprogramar"
                                                        className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100/80 rounded-lg border border-amber-100 cursor-pointer"
                                                    >
                                                        <Calendar className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onCancelar(a.id)}
                                                        aria-label="Rechazar"
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100/80 rounded-lg border border-red-100 cursor-pointer"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {reprogramando === a.id && (
                                        <div className="flex flex-col gap-2 bg-slate-50/70 border border-slate-100 rounded-xl p-3">
                                            {reprogramarWarnings && (reprogramarWarnings.conflicts.length > 0 || reprogramarWarnings.horario) && (
                                                <div className="flex flex-col gap-1 bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-semibold px-3 py-2 rounded-lg">
                                                    <div className="flex items-center gap-1.5">
                                                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span>Revisa antes de guardar:</span>
                                                    </div>
                                                    <ul className="pl-5 list-disc font-normal">
                                                        {reprogramarWarnings.horario && <li>{reprogramarWarnings.horario}</li>}
                                                        {reprogramarWarnings.conflicts.map((c) => (
                                                            <li key={c.id}>
                                                                Se cruza con {c.patient_name} · {formatRango(c)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="datetime-local"
                                                    value={nuevaFecha}
                                                    onChange={(e) => {
                                                        setNuevaFecha(e.target.value);
                                                        setReprogramarWarnings(null);
                                                    }}
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleReprogramar(a.id)}
                                                    className={`text-xs font-bold text-white px-3.5 py-2 rounded-lg cursor-pointer ${
                                                        reprogramarWarnings && (reprogramarWarnings.conflicts.length > 0 || reprogramarWarnings.horario)
                                                            ? 'bg-amber-600 hover:bg-amber-700'
                                                            : 'bg-blue-600 hover:bg-blue-750'
                                                    }`}
                                                >
                                                    {reprogramarWarnings && (reprogramarWarnings.conflicts.length > 0 || reprogramarWarnings.horario)
                                                        ? 'Guardar de todas formas'
                                                        : 'Guardar'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
        </div>
    );
}

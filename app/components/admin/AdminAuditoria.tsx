'use client';

import { CheckCircle2, XCircle, Pencil, ShieldCheck, History } from 'lucide-react';

interface Registro {
    id: number;
    actor_email: string | null;
    action: string;
    target_type: string;
    target_id: string;
    detalle: string | null;
    created_at: string;
}

const ACTION_META: Record<string, { label: string; icon: typeof History; className: string }> = {
    aprobar_medico: { label: 'Aprobó médico', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    rechazar_medico: { label: 'Rechazó médico', icon: XCircle, className: 'bg-red-50 text-red-600 border-red-100' },
    editar_medico: { label: 'Editó médico', icon: Pencil, className: 'bg-blue-50 text-blue-600 border-blue-100' },
    cambiar_status_medico: { label: 'Cambió estado', icon: Pencil, className: 'bg-blue-50 text-blue-600 border-blue-100' },
    cambiar_rol: { label: 'Cambió rol', icon: ShieldCheck, className: 'bg-amber-50 text-amber-600 border-amber-100' },
};

export default function AdminAuditoria({ registros }: { registros: Registro[] }) {
    if (registros.length === 0) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
                    <History className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Sin actividad todavía</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Aquí aparecerá el historial en cuanto se aprueben, rechacen o editen médicos, o se cambien roles.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-50">
                {registros.map((registro) => {
                    const meta = ACTION_META[registro.action] ?? {
                        label: registro.action,
                        icon: History,
                        className: 'bg-slate-100 text-slate-500 border-slate-200',
                    };
                    const Icon = meta.icon;
                    return (
                        <div key={registro.id} className="flex items-start gap-3 p-4">
                            <span className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${meta.className}`}>
                                <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-800">{meta.label}</span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(registro.created_at).toLocaleString('es-EC')}
                                    </span>
                                </div>
                                {registro.detalle && (
                                    <p className="text-xs text-slate-500 mt-0.5">{registro.detalle}</p>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1">
                                    por {registro.actor_email ?? 'admin desconocido'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

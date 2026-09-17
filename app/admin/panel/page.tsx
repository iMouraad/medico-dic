import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/server';
import PageHeader from '@/app/components/PageHeader';
import StatCard from '@/app/components/dashboard/StatCard';
import VisitasChart, { type DailyPoint } from '@/app/components/dashboard/VisitasChart';
import AccionesRapidasAdmin from '@/app/components/admin/AccionesRapidasAdmin';
import {
    Stethoscope,
    Users,
    History,
    Clock,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    CheckCircle,
    XCircle as XCircleIcon,
    Pencil,
} from 'lucide-react';

const ACTION_META: Record<string, { label: string; icon: typeof History }> = {
    aprobar_medico: { label: 'Aprobó médico', icon: CheckCircle },
    rechazar_medico: { label: 'Rechazó médico', icon: XCircleIcon },
    editar_medico: { label: 'Editó médico', icon: Pencil },
    cambiar_status_medico: { label: 'Cambió estado', icon: Pencil },
    cambiar_rol: { label: 'Cambió rol', icon: ShieldCheck },
    crear_usuario: { label: 'Creó usuario', icon: Users },
};

const CHART_DAYS = 14;

export default async function AdminPanelHub() {
    const supabase = await createClient();

    const chartStart = new Date();
    chartStart.setDate(chartStart.getDate() - (CHART_DAYS - 1));

    const [{ data: doctors }, { data: profiles }, { data: actividad }, { data: registrosRecientes }] = await Promise.all([
        supabase.from('doctors').select('status'),
        supabase.from('profiles').select('role'),
        supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('doctors').select('created_at').gte('created_at', chartStart.toISOString()),
    ]);

    const totalMedicos = doctors?.length ?? 0;
    const pendientes = doctors?.filter((d) => d.status === 'pendiente').length ?? 0;
    const aprobados = doctors?.filter((d) => d.status === 'aprobado').length ?? 0;
    const rechazados = doctors?.filter((d) => d.status === 'rechazado').length ?? 0;
    const totalUsuarios = profiles?.length ?? 0;
    const totalAdmins = profiles?.filter((p) => p.role === 'admin').length ?? 0;

    const registrosPorDia = new Map<string, number>();
    for (const r of registrosRecientes ?? []) {
        const day = r.created_at.slice(0, 10);
        registrosPorDia.set(day, (registrosPorDia.get(day) ?? 0) + 1);
    }
    const chartData: DailyPoint[] = Array.from({ length: CHART_DAYS }, (_, i) => {
        const date = new Date(chartStart);
        date.setDate(date.getDate() + i);
        const day = date.toISOString().slice(0, 10);
        return { day, profile_views: registrosPorDia.get(day) ?? 0 };
    });

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10 flex flex-col gap-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
                <PageHeader
                    title="Resumen"
                    description="Vista general de la actividad de NEOSDOC. Usa el menú de la izquierda para administrar cada sección."
                />
                <AccionesRapidasAdmin />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Total médicos" value={totalMedicos} icon={Stethoscope} color="slate" />
                <StatCard label="Pendientes" value={pendientes} icon={Clock} color="amber" />
                <StatCard label="Aprobados" value={aprobados} icon={CheckCircle2} color="emerald" />
                <StatCard label="Rechazados" value={rechazados} icon={XCircle} color="red" />
                <StatCard label="Usuarios totales" value={totalUsuarios} icon={Users} color="blue" />
                <StatCard label="Admins" value={totalAdmins} icon={ShieldCheck} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Crecimiento</h2>
                    <VisitasChart data={chartData} titulo="Médicos registrados" unidadSingular="médico" unidadPlural="médicos" />
                </div>

                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actividad reciente</h2>
                        <Link href="/admin/auditoria" className="text-[11px] font-bold text-brand-blue hover:text-brand-blue-dark">
                            Ver todo
                        </Link>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                        {!actividad || actividad.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400 font-medium">Sin actividad todavía.</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {actividad.map((registro) => {
                                    const meta = ACTION_META[registro.action] ?? { label: registro.action, icon: History };
                                    const Icon = meta.icon;
                                    return (
                                        <div key={registro.id} className="flex items-start gap-2.5 p-3.5">
                                            <span className="w-7 h-7 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-3.5 h-3.5" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-700">{meta.label}</p>
                                                {registro.detalle && (
                                                    <p className="text-[11px] text-slate-500 truncate">{registro.detalle}</p>
                                                )}
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(registro.created_at).toLocaleString('es-EC')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

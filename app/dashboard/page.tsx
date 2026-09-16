import { redirect } from 'next/navigation';
import { UserCircle2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/server';
import ResumenMedico from '@/app/components/dashboard/ResumenMedico';
import ProximasCitas from '@/app/components/dashboard/ProximasCitas';
import VisitasChart, { type DailyPoint } from '@/app/components/dashboard/VisitasChart';
import AnunciosBanner from '@/app/components/AnunciosBanner';
import AvisoPerfil from '@/app/components/dashboard/AvisoPerfil';
import AccionesRapidas from '@/app/components/dashboard/AccionesRapidas';
import ChecklistPerfil from '@/app/components/dashboard/ChecklistPerfil';
import { STATUS_LABEL, type ActivityStreak, type Ad, type Appointment, type Doctor } from '@/app/lib/types';

const CHART_DAYS = 14;

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle<Doctor>();

    if (doctor) {
        await supabase.rpc('mark_doctor_active', { target_id: doctor.id });
    }

    const { data: streak } = doctor
        ? await supabase
              .from('activity_streak')
              .select('*')
              .eq('doctor_id', doctor.id)
              .maybeSingle<ActivityStreak>()
        : { data: null };

    const { data: ads } = await supabase
        .from('ads')
        .select('*')
        .eq('estado', 'activo')
        .order('created_at', { ascending: false })
        .limit(6);

    const { count: pendingAppointments } = doctor
        ? await supabase
              .from('appointments')
              .select('id', { count: 'exact', head: true })
              .eq('doctor_id', doctor.id)
              .eq('status', 'pendiente')
        : { count: 0 };

    const { data: upcomingAppointments } = doctor
        ? await supabase
              .from('appointments')
              .select('*')
              .eq('doctor_id', doctor.id)
              .in('status', ['pendiente', 'confirmada'])
              .gte('preferred_at', new Date().toISOString())
              .order('preferred_at', { ascending: true })
              .limit(5)
        : { data: [] };

    const chartStart = new Date();
    chartStart.setDate(chartStart.getDate() - (CHART_DAYS - 1));

    const { data: dailyStatsRaw } = doctor
        ? await supabase
              .from('doctor_daily_stats')
              .select('day, profile_views')
              .eq('doctor_id', doctor.id)
              .gte('day', chartStart.toISOString().slice(0, 10))
              .order('day', { ascending: true })
        : { data: [] };

    const dailyStatsMap = new Map((dailyStatsRaw ?? []).map((d) => [d.day, d.profile_views]));
    const chartData: DailyPoint[] = Array.from({ length: CHART_DAYS }, (_, i) => {
        const date = new Date(chartStart);
        date.setDate(date.getDate() + i);
        const day = date.toISOString().slice(0, 10);
        return { day, profile_views: dailyStatsMap.get(day) ?? 0 };
    });

    const statusInfo = doctor ? STATUS_LABEL[doctor.status] : null;

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
                <div className="min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                {doctor?.profile_photo_url ? (
                                    <img src={doctor.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle2 className="w-9 h-9 text-slate-300" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-slate-800 leading-tight">
                                    Hola, {doctor?.name || 'doctor'}
                                </h1>
                                <p className="text-xs text-slate-400 font-medium">Este es el resumen de tu actividad</p>
                            </div>
                        </div>
                        {statusInfo && (
                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border flex-shrink-0 ${statusInfo.className}`}
                            >
                                {statusInfo.label}
                            </span>
                        )}
                    </div>

                    <AvisoPerfil doctor={doctor} />

                    <ResumenMedico doctor={doctor} streak={streak} pendingAppointments={pendingAppointments ?? 0} />

                    <div className="mt-10">
                        <h2 className="text-sm font-extrabold text-slate-800 mb-1">Tu actividad</h2>
                        <p className="text-xs text-slate-500 mb-4 max-w-2xl">
                            Consulta tus próximas citas y cómo ha evolucionado el interés en tu perfil durante los
                            últimos días.
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2">
                                <ProximasCitas initialAppointments={(upcomingAppointments as Appointment[]) ?? []} />
                            </div>
                            <div className="lg:col-span-3">
                                <VisitasChart data={chartData} />
                            </div>
                        </div>
                    </div>

                    {ads && ads.length > 0 && (
                        <div className="mt-10">
                            <AnunciosBanner ads={ads as Ad[]} compact />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6 lg:sticky lg:top-6">
                    <AccionesRapidas doctor={doctor} />
                    <ChecklistPerfil doctor={doctor} />
                </div>
            </div>
        </div>
    );
}

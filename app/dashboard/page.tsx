import { redirect } from 'next/navigation';
import { UserCircle2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/server';
import ResumenMedico from '@/app/components/dashboard/ResumenMedico';
import ProximasCitas from '@/app/components/dashboard/ProximasCitas';
import VisitasChart, { type DailyPoint } from '@/app/components/dashboard/VisitasChart';
import { STATUS_LABEL, type Appointment, type Doctor } from '@/app/lib/types';

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
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
            {statusInfo && (
                <span
                    className={`absolute top-10 right-4 sm:right-6 lg:right-8 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusInfo.className}`}
                >
                    {statusInfo.label}
                </span>
            )}

            <div className="flex items-center gap-5 mb-8">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    {doctor?.profile_photo_url ? (
                        <img src={doctor.profile_photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle2 className="w-14 h-14 text-slate-300" />
                    )}
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800">
                    Hola, {doctor?.name || 'doctor'}
                </h1>
            </div>

            <ResumenMedico doctor={doctor} pendingAppointments={pendingAppointments ?? 0} />

            <div className="mt-10">
                <h2 className="text-sm font-extrabold text-slate-800 mb-1">Tu actividad</h2>
                <p className="text-xs text-slate-500 mb-4 max-w-2xl">
                    Consulta tus próximas citas y cómo ha evolucionado el interés en tu perfil durante los últimos
                    días.
                </p>
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <div className="xl:col-span-2">
                        <ProximasCitas initialAppointments={(upcomingAppointments as Appointment[]) ?? []} />
                    </div>
                    <div className="xl:col-span-3">
                        <VisitasChart data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

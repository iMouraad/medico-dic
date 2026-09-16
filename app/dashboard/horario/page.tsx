import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/server';
import HorarioForm from '@/app/components/dashboard/HorarioForm';
import PageHeader from '@/app/components/PageHeader';
import { HORARIO_ATENCION_DEFAULT, type DiaBloqueado, type HorarioAtencion } from '@/app/lib/types';

export default async function HorarioPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: doctor } = await supabase
        .from('doctors')
        .select('id, horario_atencion')
        .eq('user_id', user.id)
        .maybeSingle<{ id: number; horario_atencion: HorarioAtencion }>();

    const { data: diasBloqueados } = doctor
        ? await supabase
              .from('doctor_dias_bloqueados')
              .select('*')
              .eq('doctor_id', doctor.id)
              .gte('fecha', new Date().toISOString().slice(0, 10))
              .order('fecha', { ascending: true })
        : { data: [] };

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <Link href="/dashboard/configuracion" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 mb-4 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Configuración
            </Link>
            <PageHeader
                title="Horario de atención"
                description="Define en qué días y horas atiendes normalmente, y bloquea fechas puntuales (vacaciones, feriados propios). El calendario de citas te avisará si registras algo fuera de esto."
            />
            {doctor ? (
                <HorarioForm
                    doctorId={doctor.id}
                    initialHorario={doctor.horario_atencion ?? HORARIO_ATENCION_DEFAULT}
                    initialDiasBloqueados={(diasBloqueados as DiaBloqueado[]) ?? []}
                />
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-8 text-center text-sm text-slate-400 font-medium">
                    Completa primero tu perfil para poder configurar tu horario.
                </div>
            )}
        </div>
    );
}

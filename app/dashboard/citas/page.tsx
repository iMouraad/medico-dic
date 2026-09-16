import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import CitasMedico from '@/app/components/dashboard/CitasMedico';
import PageHeader from '@/app/components/PageHeader';
import { HORARIO_ATENCION_DEFAULT, type Appointment, type HorarioAtencion } from '@/app/lib/types';

export default async function CitasPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: doctor } = await supabase
        .from('doctors')
        .select('id, duracion_consulta_minutos, horario_atencion')
        .eq('user_id', user.id)
        .maybeSingle<{ id: number; duracion_consulta_minutos: number; horario_atencion: HorarioAtencion }>();

    const { data: appointments } = doctor
        ? await supabase
              .from('appointments')
              .select('*')
              .eq('doctor_id', doctor.id)
              .order('preferred_at', { ascending: true })
        : { data: [] };

    const { data: diasBloqueados } = doctor
        ? await supabase.from('doctor_dias_bloqueados').select('fecha').eq('doctor_id', doctor.id)
        : { data: [] };

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Mis citas"
                description="Gestiona las solicitudes de cita de tus pacientes: confirma, cancela, reprograma o márcalas como completadas a medida que las vas atendiendo."
            />
            <CitasMedico
                initialAppointments={(appointments as Appointment[]) ?? []}
                doctorId={doctor?.id}
                defaultDuration={doctor?.duracion_consulta_minutos ?? 30}
                horario={doctor?.horario_atencion ?? HORARIO_ATENCION_DEFAULT}
                diasBloqueados={(diasBloqueados ?? []).map((d) => d.fecha as string)}
            />
        </div>
    );
}

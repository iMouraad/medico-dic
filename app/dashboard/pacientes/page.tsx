import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import HistorialPacientes from '@/app/components/dashboard/HistorialPacientes';
import PageHeader from '@/app/components/PageHeader';
import type { Appointment } from '@/app/lib/types';

export default async function PacientesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle<{ id: number }>();

    const { data: appointments } = doctor
        ? await supabase
              .from('appointments')
              .select('*')
              .eq('doctor_id', doctor.id)
              .order('preferred_at', { ascending: false })
        : { data: [] };

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Pacientes"
                description="Busca por cédula o nombre para ver el historial de citas de un paciente contigo."
            />
            <HistorialPacientes appointments={(appointments as Appointment[]) ?? []} />
        </div>
    );
}

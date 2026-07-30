import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import CitasMedico from '@/app/components/dashboard/CitasMedico';
import type { Appointment } from '@/app/lib/types';

export default async function CitasPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: doctor } = await supabase.from('doctors').select('id').eq('user_id', user.id).maybeSingle();

    const { data: appointments } = doctor
        ? await supabase
              .from('appointments')
              .select('*')
              .eq('doctor_id', doctor.id)
              .order('preferred_at', { ascending: true })
        : { data: [] };

    return (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-xl font-extrabold text-slate-800 mb-1">Mis citas</h1>
            <p className="text-sm text-slate-500 mb-8 max-w-2xl">
                Gestiona las solicitudes de cita de tus pacientes: confirma, cancela, reprograma o márcalas como
                completadas a medida que las vas atendiendo.
            </p>
            <CitasMedico initialAppointments={(appointments as Appointment[]) ?? []} />
        </div>
    );
}

import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import PerfilForm from '@/app/components/dashboard/PerfilForm';
import { STATUS_LABEL, type Doctor } from '@/app/lib/types';

export default async function PerfilMedicoDashboardPage() {
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

    const statusInfo = doctor ? STATUS_LABEL[doctor.status] : null;

    return (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-800 mb-1">Mi perfil</h1>
                    <p className="text-sm text-slate-500">
                        Estos datos son los que verán los pacientes en tu perfil público.
                    </p>
                </div>
                {statusInfo && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusInfo.className}`}>
                        {statusInfo.label}
                    </span>
                )}
            </div>
            <PerfilForm userId={user.id} userEmail={user.email ?? ''} doctor={doctor} />
        </div>
    );
}

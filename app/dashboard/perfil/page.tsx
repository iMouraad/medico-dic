import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/server';
import PerfilForm from '@/app/components/dashboard/PerfilForm';
import PageHeader from '@/app/components/PageHeader';
import { STATUS_LABEL, type Doctor, type Specialty } from '@/app/lib/types';

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

    const { data: specialties } = await supabase.from('specialties').select('*').order('name', { ascending: true });

    const statusInfo = doctor ? STATUS_LABEL[doctor.status] : null;

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <Link href="/dashboard/configuracion" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 mb-4 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Configuración
            </Link>
            <PageHeader title="Mi perfil" description="Estos datos son los que verán los pacientes en tu perfil público.">
                {statusInfo && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusInfo.className}`}>
                        {statusInfo.label}
                    </span>
                )}
            </PageHeader>
            <PerfilForm
                userId={user.id}
                userEmail={user.email ?? ''}
                doctor={doctor}
                specialties={(specialties as Specialty[]) ?? []}
            />
        </div>
    );
}

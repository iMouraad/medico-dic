import { createClient } from '@/app/lib/supabase/server';
import AdminPanel from '@/app/components/admin/AdminPanel';
import PageHeader from '@/app/components/PageHeader';
import type { Doctor, Specialty } from '@/app/lib/types';

export default async function AdminPage() {
    const supabase = await createClient();

    const { data: doctors } = await supabase
        .from('doctors')
        .select('*')
        .order('id', { ascending: false });

    const { data: specialties } = await supabase.from('specialties').select('*').order('name', { ascending: true });

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Panel de administración"
                description="Aprueba o rechaza el registro de nuevos médicos, edita sus datos y supervisa la actividad general de la plataforma."
            />
            <AdminPanel initialDoctors={(doctors as Doctor[]) ?? []} specialties={(specialties as Specialty[]) ?? []} />
        </div>
    );
}

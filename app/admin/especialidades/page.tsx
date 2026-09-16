import { createClient } from '@/app/lib/supabase/server';
import AdminEspecialidades from '@/app/components/admin/AdminEspecialidades';
import PageHeader from '@/app/components/PageHeader';
import type { Specialty } from '@/app/lib/types';

export default async function AdminEspecialidadesPage() {
    const supabase = await createClient();

    const { data: specialties } = await supabase.from('specialties').select('*').order('name', { ascending: true });

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Especialidades"
                description="Administra la lista de especialidades que los médicos pueden elegir en su perfil."
            />
            <AdminEspecialidades initialSpecialties={(specialties as Specialty[]) ?? []} />
        </div>
    );
}

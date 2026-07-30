import { createClient } from '@/app/lib/supabase/server';
import AdminPanel from '@/app/components/admin/AdminPanel';
import type { Doctor } from '@/app/lib/types';

export default async function AdminPage() {
    const supabase = await createClient();

    const { data: doctors } = await supabase
        .from('doctors')
        .select('*')
        .order('id', { ascending: false });

    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-xl font-extrabold text-slate-800 mb-1">Panel de administración</h1>
            <p className="text-sm text-slate-500 mb-8 max-w-2xl">
                Aprueba o rechaza el registro de nuevos médicos, edita sus datos y supervisa la actividad general
                de la plataforma.
            </p>
            <AdminPanel initialDoctors={(doctors as Doctor[]) ?? []} />
        </div>
    );
}

import { createClient } from '@/app/lib/supabase/server';
import PageHeader from '@/app/components/PageHeader';
import AdminUsuarios from '@/app/components/admin/AdminUsuarios';

export default async function AdminUsuariosPage() {
    const supabase = await createClient();

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role, created_at')
        .order('created_at', { ascending: false });

    const { data: doctors } = await supabase
        .from('doctors')
        .select('user_id, name, email, username');

    const doctorByUserId = new Map((doctors ?? []).map((d) => [d.user_id, d]));

    const usuarios = (profiles ?? []).map((p) => {
        const doctor = doctorByUserId.get(p.id);
        return {
            id: p.id,
            role: p.role as 'medico' | 'admin',
            created_at: p.created_at,
            email: doctor?.email ?? null,
            name: doctor?.name ?? null,
            username: doctor?.username ?? null,
        };
    });

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Gestión de usuarios"
                description="Todas las cuentas registradas en NEOSDOC (médicos y administradores) y su rol de acceso."
            />
            <AdminUsuarios usuarios={usuarios} />
        </div>
    );
}

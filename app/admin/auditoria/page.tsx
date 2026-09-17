import { createClient } from '@/app/lib/supabase/server';
import PageHeader from '@/app/components/PageHeader';
import AdminAuditoria from '@/app/components/admin/AdminAuditoria';

export default async function AdminAuditoriaPage() {
    const supabase = await createClient();

    const { data: registros } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Auditoría"
                description="Historial de acciones de administración: aprobaciones, rechazos, ediciones y cambios de rol."
            />
            <AdminAuditoria registros={registros ?? []} />
        </div>
    );
}

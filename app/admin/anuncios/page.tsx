import { createClient } from '@/app/lib/supabase/server';
import AdminAnuncios from '@/app/components/admin/AdminAnuncios';
import PageHeader from '@/app/components/PageHeader';
import type { Ad } from '@/app/lib/types';

export default async function AdminAnunciosPage() {
    const supabase = await createClient();

    const { data: ads } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Anuncios"
                description="Sube y administra publicidad de negocios externos (clínicas, farmacias, veterinarias, etc.). El material lo entrega el anunciante; tú lo subes y controlas cuándo se muestra a médicos y pacientes."
            />
            <AdminAnuncios initialAds={(ads as Ad[]) ?? []} />
        </div>
    );
}

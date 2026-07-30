import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import PanelShell from '@/app/components/PanelShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'admin') redirect('/admin');

    const { data: doctor } = await supabase
        .from('doctors')
        .select('name, profile_photo_url')
        .eq('user_id', user.id)
        .maybeSingle();

    return (
        <PanelShell
            role="medico"
            title="Panel médico"
            displayName={doctor?.name || user.email || 'Mi cuenta'}
            avatarUrl={doctor?.profile_photo_url ?? null}
        >
            {children}
        </PanelShell>
    );
}

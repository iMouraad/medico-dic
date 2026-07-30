import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import PanelShell from '@/app/components/PanelShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect('/');

    return (
        <PanelShell role="admin" title="Panel de administración" displayName={user.email ?? 'Admin'} avatarUrl={null}>
            {children}
        </PanelShell>
    );
}

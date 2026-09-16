import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import MensajesContacto from '@/app/components/dashboard/MensajesContacto';
import PageHeader from '@/app/components/PageHeader';
import type { ContactMessage } from '@/app/lib/types';

export default async function MensajesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle<{ id: number }>();

    const { data: mensajes } = doctor
        ? await supabase
              .from('contact_messages')
              .select('*')
              .eq('doctor_id', doctor.id)
              .order('created_at', { ascending: false })
        : { data: [] };

    return (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10">
            <PageHeader
                title="Mensajes"
                description="Mensajes que dejaron los pacientes desde tu perfil público. Tú decides cómo responder, por correo o WhatsApp."
            />
            <MensajesContacto initialMessages={(mensajes as ContactMessage[]) ?? []} />
        </div>
    );
}

import { supabase } from '@/app/lib/supabaseClient';
import ListadoClinicas from '@/app/components/ListadoClinicas';

export default async function ClinicasPage() {
    const { data: doctors } = await supabase.from('doctors').select('*').eq('status', 'aprobado');

    return <ListadoClinicas doctors={doctors ?? []} />;
}

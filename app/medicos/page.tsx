import { supabase } from '@/app/lib/supabaseClient';
import ListadoMedicos from '@/app/components/ListadoMedicos';
import type { Specialty } from '@/app/lib/types';

export default async function MedicosPage() {
    const { data: doctors } = await supabase.from('doctors').select('*').eq('status', 'aprobado');
    const { data: specialties } = await supabase.from('specialties').select('*').order('name', { ascending: true });

    return <ListadoMedicos doctors={doctors ?? []} specialtyCatalog={(specialties as Specialty[]) ?? []} />;
}

import { supabase } from '@/app/lib/supabaseClient';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import BottomNavMobile from '@/app/components/BottomNavMobile';
import MapaPublicoCliente from '@/app/components/MapaPublicoCliente';
import type { Doctor } from '@/app/lib/types';

export default async function MapaPage() {
    const { data: doctors } = await supabase.from('doctors').select('*').eq('status', 'aprobado');

    const pins = ((doctors as Doctor[]) ?? []).map((d) => ({
        id: d.id,
        name: d.name ?? 'Médico',
        specialty: d.specialty ?? '',
        city: d.city ?? '',
        consultation_price: d.consultation_price,
        profile_photo_url: d.profile_photo_url ?? '',
        verified_senescyt: d.verified_senescyt ?? false,
        latitude: d.latitude,
        longitude: d.longitude,
    }));

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50 pb-16 md:pb-0">
            <Header />

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
                <MapaPublicoCliente doctors={pins} />
            </main>

            <Footer />
            <BottomNavMobile />
        </div>
    );
}

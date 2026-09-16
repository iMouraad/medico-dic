'use client';

import { useEffect, useState } from 'react';
import { Heart, Search } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import TarjetaMedico from '@/app/components/TarjetaMedico';
import BottomNavMobile from '@/app/components/BottomNavMobile';
import { createClient } from '@/app/lib/supabase/client';
import { getFavoritos } from '@/app/lib/favoritos';
import type { Doctor } from '@/app/lib/types';

export default function FavoritosPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelado = false;
        const ids = getFavoritos();

        // Siempre resolvemos vía promesa (incluso sin favoritos) para que la
        // actualización de estado quede fuera del cuerpo síncrono del efecto.
        const cargar = ids.length === 0
            ? Promise.resolve([] as Doctor[])
            : createClient()
                .from('doctors')
                .select('*')
                .in('id', ids)
                .eq('status', 'aprobado')
                .then(({ data }) => (data as Doctor[]) ?? []);

        cargar.then((data) => {
            if (cancelado) return;
            setDoctors(data);
            setLoading(false);
        });

        return () => {
            cancelado = true;
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50 pb-16 md:pb-0">
            <Header />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Mis médicos favoritos</span>
                </div>

                {loading ? (
                    <p className="text-sm text-slate-400">Cargando...</p>
                ) : doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor) => (
                            <TarjetaMedico
                                key={doctor.id}
                                doctor={{
                                    id: doctor.id,
                                    name: doctor.name ?? 'Médico',
                                    specialty: doctor.specialty ?? '',
                                    city: doctor.city ?? '',
                                    consultation_price: doctor.consultation_price,
                                    whatsapp: doctor.whatsapp ?? '',
                                    plan: doctor.plan ?? '',
                                    profile_photo_url: doctor.profile_photo_url ?? '',
                                    modalities: doctor.modalities ?? [],
                                    verified_senescyt: doctor.verified_senescyt ?? false,
                                    horario_atencion: doctor.horario_atencion,
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mb-1">Todavía no tienes favoritos</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Toca el corazón en la tarjeta de un médico para guardarlo aquí. Se guarda solo en este dispositivo.
                        </p>
                    </div>
                )}
            </main>

            <Footer />
            <BottomNavMobile />
        </div>
    );
}

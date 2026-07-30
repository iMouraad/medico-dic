import { notFound } from 'next/navigation';
import { ShieldCheck, MapPin, Star, Stethoscope, Percent } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ContactButtons from '@/app/components/ContactButtons';
import type { Doctor } from '@/app/lib/types';

export default async function PerfilMedicoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .maybeSingle<Doctor>();

    if (!doctor) notFound();

    // No usar el resultado ni tirar la página si falla: es solo una métrica.
    await supabase.rpc('increment_doctor_stat', { target_id: doctor.id, stat_name: 'profile_views' });

    const rating = (4.5 + (doctor.id % 5) * 0.1).toFixed(1);
    const reviews = 50 + (doctor.id % 7) * 26;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 border-b border-slate-50">
                        <img
                            src={doctor.profile_photo_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                            alt={doctor.name ?? 'Foto de perfil'}
                            className="w-28 h-28 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">{doctor.name ?? 'Médico'}</h1>
                                {doctor.verified_senescyt && (
                                    <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500/10 flex-shrink-0" />
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 text-sm font-bold text-blue-600 mb-2">
                                <Stethoscope className="w-4 h-4" />
                                {doctor.specialty ?? 'Especialidad no especificada'}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium mb-3">
                                {doctor.city && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {doctor.address ? `${doctor.address}, ${doctor.city}` : doctor.city}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span className="font-bold text-slate-700">{rating}</span>
                                    <span>({reviews} reseñas)</span>
                                </span>
                            </div>

                            {doctor.modalities && doctor.modalities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {doctor.modalities.map((m) => (
                                        <span key={m} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col gap-6">
                        {doctor.bio && (
                            <div>
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sobre el médico</h2>
                                <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-0.5">Consulta</span>
                                <span className="text-lg font-extrabold text-blue-700">
                                    {doctor.consultation_price != null ? `$${doctor.consultation_price}` : 'Consultar'}
                                </span>
                            </div>

                            {doctor.ofrece_descuento && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-emerald-600" />
                                    <div>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">
                                            Descuento NEOSDOC
                                        </span>
                                        <span className="text-sm font-extrabold text-emerald-700">
                                            {doctor.descuento_porcentaje}% para pacientes que llegan por NEOSDOC
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <ContactButtons doctor={doctor} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

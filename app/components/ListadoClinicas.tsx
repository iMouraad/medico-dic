'use client';

import { useState } from 'react';
import { Building2, MapPin, Search as SearchIcon } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import BottomNavMobile from './BottomNavMobile';
import PageHeader from './PageHeader';
import TarjetaMedico from './TarjetaMedico';
import CustomDropdown from './CustomDropdown';
import { CIUDADES_ECUADOR, SECTORES_ESTABLECIMIENTO, type HorarioAtencion } from '@/app/lib/types';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    sector: string | null;
    consultation_price: number | null;
    whatsapp: string;
    plan: string;
    profile_photo_url: string;
    modalities: string[];
    verified_senescyt: boolean;
    horario_atencion?: HorarioAtencion | null;
}

const SIN_ESPECIFICAR = 'Sin especificar';

export default function ListadoClinicas({ doctors }: { doctors: Doctor[] }) {
    const [sector, setSector] = useState('');
    const [ciudad, setCiudad] = useState('');

    const cities = [
        ...new Set([...CIUDADES_ECUADOR, ...doctors.map((d) => d.city).filter(Boolean)]),
    ].sort();

    const filtrados = doctors.filter((d) => {
        const matchSector = !sector || d.sector === sector || (sector === SIN_ESPECIFICAR && !d.sector);
        const matchCiudad = !ciudad || d.city === ciudad;
        return matchSector && matchCiudad;
    });

    // Agrupamos por sector/tipo de establecimiento — es lo que en la práctica
    // representa una "clínica": consultorio propio, clínica privada,
    // hospital, centro médico, etc. Aún no existe una entidad "clínica"
    // separada en la base de datos, así que agrupamos a los médicos reales
    // por este campo en vez de inventar datos de clínicas ficticias.
    const grupos = [...SECTORES_ESTABLECIMIENTO, SIN_ESPECIFICAR]
        .filter((s) => s !== 'Otro' || filtrados.some((d) => d.sector === 'Otro'))
        .map((nombreSector) => ({
            nombreSector,
            doctores: filtrados.filter((d) =>
                nombreSector === SIN_ESPECIFICAR ? !d.sector : d.sector === nombreSector
            ),
        }))
        .filter((g) => g.doctores.length > 0);

    const hayFiltros = !!sector || !!ciudad;

    return (
        <div className="flex flex-col min-h-screen bg-page-bg/30 pb-16 md:pb-0">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <PageHeader
                    title="Clínicas y consultorios"
                    description="Médicos agrupados por el tipo de consultorio, clínica o centro médico donde atienden."
                />

                {/* Barra de búsqueda */}
                <div className="bg-white p-3.5 rounded-2xl md:rounded-full border border-brand-turquoise/15 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-8">
                    <div className="flex-1 min-w-0">
                        <CustomDropdown
                            label="Tipo de establecimiento"
                            options={SECTORES_ESTABLECIMIENTO}
                            selected={sector}
                            onChange={setSector}
                            icon={Building2}
                            searchPlaceholder="Buscar tipo..."
                        />
                    </div>
                    <div className="hidden md:block w-px h-8 bg-slate-200" />
                    <div className="flex-1 min-w-0">
                        <CustomDropdown
                            label="Ciudad"
                            options={cities}
                            selected={ciudad}
                            onChange={setCiudad}
                            icon={MapPin}
                            searchPlaceholder="Buscar ciudad..."
                        />
                    </div>
                    {hayFiltros && (
                        <button
                            type="button"
                            onClick={() => {
                                setSector('');
                                setCiudad('');
                            }}
                            className="flex-shrink-0 text-xs font-bold text-brand-turquoise hover:text-brand-blue px-4 py-2 transition-colors cursor-pointer"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                <p className="text-xs font-bold text-slate-400 mb-6">
                    Mostrando {filtrados.length} {filtrados.length === 1 ? 'médico' : 'médicos'}
                </p>

                {grupos.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        {grupos.map(({ nombreSector, doctores }) => (
                            <section key={nombreSector}>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                                    <Building2 className="w-4 h-4 text-brand-turquoise" />
                                    <span>{nombreSector}</span>
                                    <span className="text-slate-300">· {doctores.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {doctores.map((doctor) => (
                                        <TarjetaMedico key={doctor.id} doctor={doctor} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3">
                            <SearchIcon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mb-1">Sin resultados</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            No encontramos médicos que coincidan con la búsqueda. Intenta con otros términos o limpia los filtros.
                        </p>
                    </div>
                )}
            </main>

            <Footer />
            <BottomNavMobile />
        </div>
    );
}

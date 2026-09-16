'use client';

import { useState } from 'react';
import { Stethoscope, MapPin, Search as SearchIcon } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import BottomNavMobile from './BottomNavMobile';
import PageHeader from './PageHeader';
import TarjetaMedico from './TarjetaMedico';
import CustomDropdown from './CustomDropdown';
import { CIUDADES_ECUADOR, type Specialty, type HorarioAtencion } from '@/app/lib/types';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    consultation_price: number | null;
    whatsapp: string;
    plan: string;
    profile_photo_url: string;
    modalities: string[];
    verified_senescyt: boolean;
    horario_atencion?: HorarioAtencion | null;
}

interface Props {
    doctors: Doctor[];
    specialtyCatalog: Specialty[];
}

export default function ListadoMedicos({ doctors, specialtyCatalog }: Props) {
    const [especialidad, setEspecialidad] = useState('');
    const [ciudad, setCiudad] = useState('');

    const specialties = [
        ...new Set([...specialtyCatalog.map((s) => s.name), ...doctors.map((d) => d.specialty).filter(Boolean)]),
    ].sort();
    const cities = [
        ...new Set([...CIUDADES_ECUADOR, ...doctors.map((d) => d.city).filter(Boolean)]),
    ].sort();

    const filtrados = doctors.filter((d) => {
        const matchEspecialidad = !especialidad || d.specialty === especialidad;
        const matchCiudad = !ciudad || d.city === ciudad;
        return matchEspecialidad && matchCiudad;
    });

    const hayFiltros = !!especialidad || !!ciudad;

    return (
        <div className="flex flex-col min-h-screen bg-page-bg/30 pb-16 md:pb-0">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <PageHeader
                    title="Todos los médicos"
                    description="Busca por especialidad y ciudad para encontrar al médico ideal en NeosDoc."
                />

                {/* Barra de búsqueda */}
                <div className="bg-white p-3.5 rounded-2xl md:rounded-full border border-brand-turquoise/15 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-8">
                    <div className="flex-1 min-w-0">
                        <CustomDropdown
                            label="Especialidad"
                            options={specialties}
                            selected={especialidad}
                            onChange={setEspecialidad}
                            icon={Stethoscope}
                            searchPlaceholder="Buscar especialidad..."
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
                                setEspecialidad('');
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

                {filtrados.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtrados.map((doctor) => (
                            <TarjetaMedico key={doctor.id} doctor={doctor} />
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

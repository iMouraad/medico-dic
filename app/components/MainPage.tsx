'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Stethoscope, MapPin, Search as SearchIcon } from 'lucide-react';
import Header from './Header';
import CarruselVIP from './CarruselVIP';
import TarjetaMedico from './TarjetaMedico';
import MapaMedicos from './MapaMedicos';
import Footer from './Footer';
import CustomDropdown from './CustomDropdown';
import ParaPacientes from './ParaPacientes';
import ParaMedicos from './ParaMedicos';
import ParaSocios from './ParaSocios';
import ComoFunciona from './ComoFunciona';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    consultation_price: number;
    whatsapp: string;
    plan: string;
    profile_photo_url: string;
    modalities: string[];
    verified_senescyt: boolean;
}

interface MainPageProps {
    doctors: Doctor[];
}

export default function MainPage({ doctors }: { doctors: Doctor[] }) {
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    
    // States for active filtering (applied when clicking "Buscar")
    const [activeSpecialty, setActiveSpecialty] = useState('');
    const [activeCity, setActiveCity] = useState('');

    const specialties = [...new Set(doctors.map(d => d.specialty))].sort();
    const cities = [...new Set(doctors.map(d => d.city))].sort();

    // Filter doctors based on active filters
    const filteredDoctors = doctors.filter((doc) => {
        const matchesSpecialty = activeSpecialty ? doc.specialty === activeSpecialty : true;
        const matchesCity = activeCity ? doc.city === activeCity : true;
        return matchesSpecialty && matchesCity;
    });

    // Destacados: Filtered or static premium list of VIPs (plan === 'Destacado')
    const destacados = doctors
        .filter((d) => d.plan === 'Destacado')
        .slice(0, 3);

    const handleSearch = () => {
        setActiveSpecialty(selectedSpecialty);
        setActiveCity(selectedCity);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            {/* Header */}
            <Header />

            {/* Hero Section with Ecuador Banner */}
            <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-slate-50/20">
                {/* Background Banner Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-90 select-none pointer-events-none"
                    style={{ 
                        backgroundImage: `url('/ecuador_hero_banner.png')`,
                        backgroundPosition: 'center 30%',
                    }}
                />
                {/* Blur / Light overlays to blend with mockup style */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent md:to-white/10" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-slate-50/50" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center flex flex-col items-center">
                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-[1.15] max-w-3xl mb-4">
                        El directorio médico que conecta a Ecuador con la salud
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm md:text-base text-slate-500 max-w-2xl mb-8 leading-relaxed">
                        Encuentra al médico ideal cerca de ti. Perfil 100% gratuito para médicos. Acceso directo a un cuerpo médico real para marcas y proveedores del sector salud.
                    </p>

                    {/* Search Floating Bar */}
                    <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-3.5 rounded-2xl md:rounded-full border border-slate-100 shadow-lg flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        {/* Selector de Especialidad */}
                        <div className="flex-1 min-w-0">
                            <CustomDropdown
                                label="Selecciona Especialidad"
                                options={specialties}
                                selected={selectedSpecialty}
                                onChange={setSelectedSpecialty}
                                icon={Stethoscope}
                                searchPlaceholder="Buscar especialidad..."
                            />
                        </div>

                        <div className="hidden md:block w-px h-8 bg-slate-200" />

                        {/* Selector de Ciudad */}
                        <div className="flex-1 min-w-0">
                            <CustomDropdown
                                label="Ciudad"
                                options={cities}
                                selected={selectedCity}
                                onChange={setSelectedCity}
                                icon={MapPin}
                                searchPlaceholder="Buscar ciudad..."
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-750 text-white font-bold text-sm px-8 py-3.5 rounded-xl md:rounded-full transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md active:scale-98"
                        >
                            <SearchIcon className="w-4 h-4" />
                            <span>Buscar</span>
                        </button>
                    </div>

                    {/* CTA secundario para médicos */}
                    <Link
                        href="/registro"
                        className="mt-5 text-xs font-bold text-blue-700 hover:text-blue-800 underline underline-offset-4 decoration-blue-200 hover:decoration-blue-400 transition-colors"
                    >
                        Soy médico, quiero mi perfil gratis →
                    </Link>
                </div>
            </section>

            {/* Content Container */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-12 w-full">
                
                {/* Clinics Section */}
                <CarruselVIP />

                {/* Featured Doctors */}
                {destacados.length > 0 && (
                    <section id="medicos">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>Médicos Destacados</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {destacados.map((doctor) => (
                                <TarjetaMedico key={doctor.id} doctor={doctor} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Para pacientes */}
                <ParaPacientes />

                {/* Map Section */}
                <MapaMedicos />

                {/* Para médicos */}
                <ParaMedicos />

                {/* Cómo funciona */}
                <ComoFunciona />

                {/* Para socios comerciales */}
                <ParaSocios />

                {/* All Doctors / Filtered Grid */}
                <section className="border-t border-slate-100 pt-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-extrabold text-slate-800">
                            {activeSpecialty || activeCity ? 'Resultados de búsqueda' : 'Todos los médicos'}
                        </h2>
                        {(activeSpecialty || activeCity) && (
                            <button
                                onClick={() => {
                                    setSelectedSpecialty('');
                                    setSelectedCity('');
                                    setActiveSpecialty('');
                                    setActiveCity('');
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    {filteredDoctors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDoctors.map((doctor) => (
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
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

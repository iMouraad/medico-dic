'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Star, Stethoscope, MapPin, Search as SearchIcon, SlidersHorizontal, UserPlus } from 'lucide-react';
import Header from './Header';
import CarruselVIP from './CarruselVIP';
import EspecialidadesDestacadas from './EspecialidadesDestacadas';
import MedicosCercaDeTi from './MedicosCercaDeTi';
import AnunciosBanner from './AnunciosBanner';
import TarjetaMedico from './TarjetaMedico';
import Footer from './Footer';
import CustomDropdown from './CustomDropdown';
import FiltrosModal, { type FiltrosState } from './FiltrosModal';
import BottomNavMobile from './BottomNavMobile';
import ParaMedicos from './ParaMedicos';
import ParaSocios from './ParaSocios';
import { FEATURES } from '@/app/lib/featureFlags';
import {
    CIUDADES_ECUADOR,
    SECTORES_ESTABLECIMIENTO,
    RANGOS_PRECIO,
    type Ad,
    type Specialty,
    type HorarioAtencion,
} from '@/app/lib/types';

const MapaMedicos = dynamic(() => import('./MapaMedicos'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[460px] bg-slate-100 rounded-3xl border border-slate-100 animate-pulse" />
    ),
});

const FILTROS_VACIOS: FiltrosState = { especialidades: [], ciudades: [], sectores: [], precio: null };

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
    latitude: number | null;
    longitude: number | null;
    horario_atencion?: HorarioAtencion | null;
    sector?: string | null;
}

interface MainPageProps {
    doctors: Doctor[];
    ads?: Ad[];
    specialtyCatalog?: Specialty[];
}

export default function MainPage({ doctors, ads = [], specialtyCatalog = [] }: MainPageProps) {
    // Selección rápida en la barra hero (especialidad/ciudad únicas)
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Filtros aplicados (especialidad/ciudad/sector admiten selección múltiple
    // vía el modal de Filtros; entre bloques se combinan con AND, dentro de
    // un mismo bloque con OR).
    const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_VACIOS);
    const [showFiltros, setShowFiltros] = useState(false);
    const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number } | null>(null);
    const [buscando, setBuscando] = useState(false);

    const filtrosActivosCount =
        filtros.especialidades.length + filtros.ciudades.length + filtros.sectores.length + (filtros.precio ? 1 : 0);

    // El buscador se llena desde el catálogo/lista curada, no solo de los
    // médicos ya registrados, para que funcione desde el día uno aunque
    // todavía haya pocos médicos en la plataforma.
    const specialties = [
        ...new Set([...specialtyCatalog.map((s) => s.name), ...doctors.map((d) => d.specialty).filter(Boolean)]),
    ].sort();
    const cities = [
        ...new Set([...CIUDADES_ECUADOR, ...doctors.map((d) => d.city).filter(Boolean)]),
    ].sort();
    const sectores = [
        ...new Set([...SECTORES_ESTABLECIMIENTO, ...doctors.map((d) => d.sector).filter(Boolean) as string[]]),
    ];

    // Lógica de combinación: AND entre Especialidad/Ubicación/Sector/Precio,
    // OR entre las opciones marcadas dentro de un mismo bloque (ej. Quito +
    // Guayaquil devuelve médicos de cualquiera de las dos ciudades).
    const filteredDoctors = doctors.filter((doc) => {
        const matchesEspecialidad =
            filtros.especialidades.length === 0 || filtros.especialidades.includes(doc.specialty);
        const matchesCiudad = filtros.ciudades.length === 0 || filtros.ciudades.includes(doc.city);
        const matchesSector =
            filtros.sectores.length === 0 || (!!doc.sector && filtros.sectores.includes(doc.sector));
        const matchesPrecio =
            !filtros.precio || (RANGOS_PRECIO.find((r) => r.value === filtros.precio)?.test(doc.consultation_price) ?? true);
        return matchesEspecialidad && matchesCiudad && matchesSector && matchesPrecio;
    });

    // Destacados: Filtered or static premium list of VIPs (plan === 'Destacado')
    const destacados = doctors
        .filter((d) => d.plan === 'Destacado')
        .slice(0, 3);

    const mapEmptyMessage =
        filtrosActivosCount > 0
            ? 'No encontramos médicos con esos filtros y con ubicación registrada todavía.'
            : undefined;

    const focusCiudad = async (ciudad: string) => {
        if (!ciudad) {
            setMapFocus(null);
            return;
        }
        setBuscando(true);
        try {
            const res = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city: ciudad }),
            });
            const geo = await res.json();
            setMapFocus(geo.latitude != null && geo.longitude != null ? { lat: geo.latitude, lng: geo.longitude } : null);
        } catch {
            setMapFocus(null);
        }
        setBuscando(false);
    };

    const handleSearch = async () => {
        setFiltros((f) => ({
            ...f,
            especialidades: selectedSpecialty ? [selectedSpecialty] : f.especialidades,
            ciudades: selectedCity ? [selectedCity] : f.ciudades,
        }));

        document.getElementById('mapa-medicos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        await focusCiudad(selectedCity);
    };

    const handleSelectEspecialidad = async (especialidad: string) => {
        const yaActiva = selectedSpecialty === especialidad;
        const nueva = yaActiva ? '' : especialidad;
        setSelectedSpecialty(nueva);
        setFiltros((f) => ({ ...f, especialidades: nueva ? [nueva] : [] }));
        document.getElementById('mapa-medicos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50 pb-16 md:pb-0">
            {/* Header */}
            <Header />

            {/* Hero Section — foto real de médica + paleta de marca */}
            <section className="relative w-full bg-page-bg">
                {/* Fondo recortado en su propio contenedor: así el desplegable de
                    Especialidad/Ciudad (position:absolute) no queda cortado por el
                    overflow-hidden que necesita el fondo. */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    <img
                        src="/fondo-hero.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-[80%_30%]"
                    />
                    {/* Difumina la foto hacia la izquierda (donde va el texto) con el
                        mismo tono de fondo de marca, en vez de blanco puro. */}
                    <div className="absolute inset-0 bg-gradient-to-r from-page-bg via-page-bg/55 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-page-bg/20 via-transparent to-page-bg" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 lg:pt-20 lg:pb-24">
                    <div className="max-w-xl lg:max-w-2xl">
                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-blue-dark tracking-tight leading-[1.15] mb-4">
                            El directorio médico que conecta a Ecuador con la salud
                        </h1>

                        {/* Subtitle */}
                        <p className="text-sm md:text-base text-slate-600 max-w-lg mb-8 leading-relaxed">
                            Encuentra al médico ideal cerca de ti. Perfil 100% gratuito para médicos. Acceso directo a un cuerpo médico real para marcas y proveedores del sector salud.
                        </p>
                    </div>

                    {/* Search Floating Bar */}
                    <div className="w-full max-w-3xl bg-white/95 backdrop-blur-md p-3.5 rounded-2xl md:rounded-full border border-brand-turquoise/15 shadow-lg shadow-brand-blue-dark/5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
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

                        {/* En móvil, Ciudad + Filtros comparten fila (como en la referencia);
                            en desktop "contents" los disuelve para que fluyan en la barra. */}
                        <div className="flex gap-3 md:contents">
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

                            {/* Botón de filtros avanzados */}
                            <button
                                type="button"
                                onClick={() => setShowFiltros(true)}
                                className="relative flex-shrink-0 flex items-center justify-center gap-2 border border-slate-200 hover:border-brand-turquoise/50 hover:bg-brand-turquoise/5 text-brand-blue-dark font-bold text-sm w-12 md:w-auto px-0 md:px-5 py-3.5 rounded-xl md:rounded-full transition duration-200 cursor-pointer"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden md:inline">Filtros</span>
                                {filtrosActivosCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-turquoise text-white text-[10px] font-bold flex items-center justify-center">
                                        {filtrosActivosCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={buscando}
                            className="w-full md:w-auto bg-brand-turquoise hover:brightness-95 disabled:opacity-70 text-white font-bold text-sm px-8 py-3.5 rounded-xl md:rounded-full transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md active:scale-98"
                        >
                            <SearchIcon className="w-4 h-4" />
                            <span>{buscando ? 'Buscando...' : 'Buscar'}</span>
                        </button>
                    </div>

                    {/* CTA para médicos — requisito explícito: debe tener visibilidad
                        propia en el home, no depender de que abran el menú. */}
                    <Link
                        href="/registro"
                        className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-brand-blue-dark font-extrabold text-sm px-6 py-3 rounded-full transition duration-200 shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 active:scale-98"
                    >
                        <UserPlus className="w-4 h-4" />
                        ¿Eres médico? Regístrate gratis
                    </Link>
                </div>
            </section>

            {/* Content Container */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-12 w-full">

                {/* Especialidades destacadas */}
                <EspecialidadesDestacadas
                    onSelect={handleSelectEspecialidad}
                    onVerTodas={() => setShowFiltros(true)}
                />

                {/* Clinics Section — oculto detrás de flag hasta tener clínicas reales */}
                {FEATURES.carruselVIP && <CarruselVIP />}

                {/* Anuncios de negocios en convenio */}
                <AnunciosBanner ads={ads} />

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

                {/* Map Section */}
                {/* Médicos cerca de ti — geolocalización del navegador */}
                <MedicosCercaDeTi doctors={doctors} />

                <MapaMedicos doctors={filteredDoctors} focus={mapFocus} emptyMessage={mapEmptyMessage} />

                {/* Para médicos */}
                <ParaMedicos />

                {/* Para socios comerciales */}
                <ParaSocios />
            </main>

            {/* Footer */}
            <Footer />

            {showFiltros && (
                <FiltrosModal
                    initial={filtros}
                    specialtyOptions={specialties}
                    cityOptions={cities}
                    sectorOptions={sectores}
                    onApply={(next) => {
                        setFiltros(next);
                        setShowFiltros(false);
                        if (next.ciudades.length === 1) {
                            focusCiudad(next.ciudades[0]);
                        } else {
                            setMapFocus(null);
                        }
                        document.getElementById('mapa-medicos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    onClose={() => setShowFiltros(false)}
                />
            )}

            <BottomNavMobile />
        </div>
    );
}

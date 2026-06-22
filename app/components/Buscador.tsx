'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

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

interface Props {
    doctors: Doctor[];
    onFilter: (filtered: Doctor[]) => void;
}

export default function Buscador({ doctors, onFilter }: Props) {
    const [specialty, setSpecialty] = useState('');
    const [city, setCity] = useState('');

    // Obtener especialidades y ciudades únicas
    const specialties = [...new Set(doctors.map(d => d.specialty))].sort();
    const cities = [...new Set(doctors.map(d => d.city))].sort();

    useEffect(() => {
        let filtered = doctors;

        if (specialty) {
            filtered = filtered.filter(d => d.specialty === specialty);
        }
        if (city) {
            filtered = filtered.filter(d => d.city === city);
        }

        onFilter(filtered);
    }, [specialty, city, doctors, onFilter]);

    return (
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-100/80 shadow-md mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                {/* Selector de Especialidad */}
                <CustomDropdown
                    label="Todas las Especialidades"
                    options={specialties}
                    selected={specialty}
                    onChange={setSpecialty}
                    icon={Search}
                    searchPlaceholder="Buscar especialidad..."
                />

                {/* Selector de Ciudad */}
                <CustomDropdown
                    label="Todas las Ciudades"
                    options={cities}
                    selected={city}
                    onChange={setCity}
                    icon={MapPin}
                    searchPlaceholder="Buscar ciudad..."
                />

                {/* Botón de Limpiar Global */}
                {(specialty || city) && (
                    <button
                        onClick={() => { setSpecialty(''); setCity(''); }}
                        className="px-5 py-3 text-sm text-red-500 hover:text-red-650 hover:bg-red-50/50 border border-slate-200 hover:border-red-100 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs"
                    >
                        <X className="w-4 h-4" />
                        <span>Restablecer</span>
                    </button>
                )}
            </div>
        </div>
    );
}
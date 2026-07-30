'use client';

import { useState } from 'react';
import { MapPin, ChevronRight, ShieldCheck } from 'lucide-react';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    city: string;
    profile_photo_url: string;
    verified_senescyt: boolean;
    distance: string;
    coords: { x: number; y: number }; // Coordinates inside the SVG map (0-100%)
}

const MAP_DOCTORS: Doctor[] = [
    {
        id: 1,
        name: 'Dr. Carlos Mendoza',
        specialty: 'Cardiología',
        city: 'Quito',
        profile_photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
        verified_senescyt: true,
        distance: '0.5 km',
        coords: { x: 55, y: 40 }
    },
    {
        id: 2,
        name: 'Dra. Ana Gómez',
        specialty: 'Pediatría',
        city: 'Quito',
        profile_photo_url: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&q=80&w=150',
        verified_senescyt: true,
        distance: '0.8 km',
        coords: { x: 72, y: 28 }
    },
    {
        id: 3,
        name: 'Dr. Andrés López',
        specialty: 'Traumatología',
        city: 'Quito',
        profile_photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
        verified_senescyt: true,
        distance: '1.2 km',
        coords: { x: 68, y: 75 }
    },
    {
        id: 4,
        name: 'Dra. María Fernanda Ruiz',
        specialty: 'Dermatología',
        city: 'Quito',
        profile_photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
        verified_senescyt: true,
        distance: '1.6 km',
        coords: { x: 40, y: 60 }
    }
];

export default function MapaMedicos() {
    const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);

    const activeDoctor = MAP_DOCTORS.find(d => d.id === selectedDoctorId) || MAP_DOCTORS[0];

    return (
        <section className="w-full py-8">
            {/* Seccion Titulo */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Encuentra tu médico en el mapa</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
                {/* Columna Izquierda: Lista de Medicos */}
                <div className="w-full lg:w-96 border-r border-slate-100 flex flex-col justify-between bg-white">
                    <div>
                        <div className="p-5 border-b border-slate-50">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                                Médicos cerca de ti
                            </h3>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {MAP_DOCTORS.map((doc) => {
                                const isSelected = doc.id === selectedDoctorId;
                                return (
                                    <div
                                        key={doc.id}
                                        onClick={() => setSelectedDoctorId(doc.id)}
                                        className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-200 ${
                                            isSelected 
                                                ? 'bg-blue-50/50 border-l-4 border-blue-600 pl-3' 
                                                : 'hover:bg-slate-50/60 border-l-4 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={doc.profile_photo_url}
                                                alt={doc.name}
                                                className="w-10 h-10 rounded-full object-cover border border-slate-100"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs font-bold text-slate-800 truncate">
                                                        {doc.name}
                                                    </span>
                                                    {doc.verified_senescyt && (
                                                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block">
                                                    {doc.specialty}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                {doc.distance}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-50">
                        <button className="w-full text-center py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 text-xs font-bold rounded-xl transition duration-150 cursor-pointer">
                            Ver más médicos
                        </button>
                    </div>
                </div>

                {/* Columna Derecha: Mapa Vectorial Interactivo de Quito */}
                <div className="flex-1 bg-slate-50/75 relative min-h-[380px] md:min-h-[420px] select-none overflow-hidden">
                    {/* SVG Map Layout */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        {/* Map Grid Pattern */}
                        <defs>
                            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mapGrid)" />

                        {/* Streets & Avenues */}
                        <path d="M-10 100 Q 300 120 900 180" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
                        <path d="M200 -50 L 320 500" fill="none" stroke="#e2e8f0" strokeWidth="22" strokeLinecap="round" />
                        <path d="M500 -50 L 450 500" fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
                        <path d="M0 320 L 900 240" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
                        
                        {/* Secondary streets */}
                        <line x1="80" y1="0" x2="160" y2="500" stroke="#f1f5f9" strokeWidth="6" />
                        <line x1="380" y1="0" x2="320" y2="500" stroke="#f1f5f9" strokeWidth="6" />
                        <line x1="680" y1="0" x2="620" y2="500" stroke="#f1f5f9" strokeWidth="6" />
                        <line x1="0" y1="180" x2="900" y2="100" stroke="#f1f5f9" strokeWidth="6" />
                        <line x1="0" y1="400" x2="900" y2="350" stroke="#f1f5f9" strokeWidth="6" />

                        {/* Green Areas (Parque La Carolina & Parque Metropolitano) */}
                        {/* La Carolina */}
                        <path d="M 520 220 C 550 200, 680 230, 620 320 C 580 380, 520 350, 520 220 Z" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="2" opacity="0.9" />
                        <text x="590" y="275" fill="#166534" fontFamily="sans-serif" fontSize="10" fontWeight="bold" opacity="0.75" textAnchor="middle">Parque La Carolina</text>
                        
                        {/* Parque Metropolitano */}
                        <path d="M 750 320 C 850 250, 920 320, 890 420 C 800 450, 750 400, 750 320 Z" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="2" opacity="0.9" />
                        <text x="825" y="370" fill="#166534" fontFamily="sans-serif" fontSize="10" fontWeight="bold" opacity="0.75" textAnchor="middle">Parque Metropolitano</text>

                        {/* Neighborhood labels */}
                        <text x="140" y="145" fill="#94a3b8" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="1px">EL BATÁN</text>
                        <text x="310" y="70" fill="#94a3b8" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="1px">LA FLORESTA</text>
                        <text x="460" y="160" fill="#94a3b8" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="1px">INAQUITO</text>
                        <text x="730" y="190" fill="#94a3b8" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="1px">BELLAVISTA</text>
                        <text x="180" y="445" fill="#94a3b8" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="1px">GONZÁLEZ SUÁREZ</text>
                        <text x="440" y="430" fill="#94a3b8" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="1px">LA MARISCAL</text>
                    </svg>

                    {/* Interactive Marker Pins */}
                    {MAP_DOCTORS.map((doc) => {
                        const isSelected = doc.id === selectedDoctorId;
                        return (
                            <div
                                key={doc.id}
                                className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-full cursor-pointer group/pin"
                                style={{ left: `${doc.coords.x}%`, top: `${doc.coords.y}%` }}
                                onClick={() => setSelectedDoctorId(doc.id)}
                            >
                                {/* Marker tooltip */}
                                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold whitespace-nowrap shadow-md pointer-events-none transition-all duration-200 ${
                                    isSelected 
                                        ? 'opacity-100 translate-y-0 scale-100' 
                                        : 'opacity-0 translate-y-1 scale-90 group-hover/pin:opacity-100 group-hover/pin:translate-y-0 group-hover/pin:scale-100'
                                }`}>
                                    <div className="flex flex-col items-center">
                                        <span>{doc.name}</span>
                                        <span className="text-[8px] text-blue-300 font-normal">{doc.specialty}</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>

                                {/* Pin Icon */}
                                <div className={`relative flex items-center justify-center transition-all duration-300 ${
                                    isSelected ? 'scale-125' : 'hover:scale-110'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                        isSelected 
                                            ? 'bg-blue-600 text-white shadow-blue-500/30' 
                                            : 'bg-white text-blue-600 border border-blue-100 hover:bg-blue-50'
                                    }`}>
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className={`absolute -bottom-1.5 w-3 h-1.5 rounded-full blur-[1px] bg-slate-800/20 -z-10`} />
                                </div>
                            </div>
                        );
                    })}

                    {/* Zoom / Map Controls mockup */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
                        <button className="w-8 h-8 bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer">+</button>
                        <button className="w-8 h-8 bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer">-</button>
                        <button className="w-8 h-8 bg-white hover:bg-slate-50 border border-slate-100 text-slate-600 rounded-lg flex items-center justify-center shadow-xs cursor-pointer">
                            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

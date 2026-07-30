'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

interface Clinic {
    id: number;
    name: string;
    tag: string;
    icon: React.ReactNode;
}

const CLINICS: Clinic[] = [
    {
        id: 1,
        name: 'Clínica San Francisco',
        tag: 'Descuentos exclusivos para pacientes NEOSDOC',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="#e0f2fe" />
                <circle cx="50" cy="50" r="35" fill="#0284c7" />
                <path d="M50 30V70M30 50H70" stroke="white" strokeWidth="10" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 2,
        name: 'Clínica Metropolitana',
        tag: 'Atención de urgencias 24/7',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="35" width="70" height="30" rx="6" fill="#1e3a8a" />
                <rect x="35" y="15" width="30" height="70" rx="6" fill="#1e3a8a" />
                <path d="M50 25V75M25 50H75" stroke="white" strokeWidth="6" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 3,
        name: 'Clínica Santa Lucía',
        tag: 'Especialistas certificados SENESCYT',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10L90 50L50 90L10 50Z" fill="#ecfdf5" stroke="#10b981" strokeWidth="6" />
                <path d="M50 28V72M28 50H72" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 4,
        name: 'Clínica del Sol',
        tag: 'Chequeos preventivos con tarifa preferencial',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="20" fill="#f59e0b" />
                {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const x1 = (50 + 26 * Math.cos(angle)).toFixed(2);
                    const y1 = (50 + 26 * Math.sin(angle)).toFixed(2);
                    const x2 = (50 + 38 * Math.cos(angle)).toFixed(2);
                    const y2 = (50 + 38 * Math.sin(angle)).toFixed(2);
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#f59e0b"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                    );
                })}
            </svg>
        ),
    },
    {
        id: 5,
        name: 'Clínica Internacional',
        tag: 'Red de laboratorios y diagnóstico por imagen',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="#0891b2" strokeWidth="8" strokeDasharray="15 8" />
                <circle cx="50" cy="50" r="22" fill="#0891b2" />
                <text x="50" y="55" fill="white" fontFamily="sans-serif" fontSize="18" fontWeight="bold" textAnchor="middle">ci</text>
            </svg>
        ),
    },
    {
        id: 6,
        name: 'Clínica Buen Vivir',
        tag: 'Medicina familiar y bienestar integral',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 90C50 90 85 60 85 35C85 18 70 5 50 25C30 5 15 18 15 35C15 60 50 90 50 90Z" fill="#f0fdf4" stroke="#10b981" strokeWidth="6" />
                <circle cx="50" cy="40" r="10" fill="#10b981" />
                <path d="M35 65C35 55 65 55 65 65" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
            </svg>
        ),
    },
];

const VISIBLE_COUNT = 3;

export default function CarruselVIP() {
    const [startIndex, setStartIndex] = useState(0);

    const nextSlide = () => {
        setStartIndex((prev) => (prev + 1) % CLINICS.length);
    };

    const prevSlide = () => {
        setStartIndex((prev) => (prev - 1 + CLINICS.length) % CLINICS.length);
    };

    // Auto-scroll each 5s
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    // Get clinics in circular array order
    const getVisibleClinics = () => {
        const list = [];
        for (let i = 0; i < VISIBLE_COUNT; i++) {
            list.push(CLINICS[(startIndex + i) % CLINICS.length]);
        }
        return list;
    };

    return (
        <section id="clinicas" className="w-full py-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span>Nuestras Clínicas en Convenio</span>
            </div>

            <div className="relative flex items-center">
                {/* Left Arrow */}
                <button
                    onClick={prevSlide}
                    className="absolute -left-4 z-10 w-10 h-10 bg-blue-900 hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Grid of large clinic cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-6">
                    {getVisibleClinics().map((clinic, idx) => (
                        <div
                            key={`${clinic.id}-${idx}`}
                            className="bg-white rounded-3xl p-8 flex flex-col items-center text-center gap-4 border border-slate-100 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 min-h-[260px] justify-center"
                        >
                            <div className="w-16 h-16">{clinic.icon}</div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-blue-600 font-extrabold block mb-1.5">
                                    Clínica en convenio
                                </span>
                                <h3 className="text-lg font-black text-slate-800 leading-tight mb-2">{clinic.name}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed max-w-[220px] mx-auto">{clinic.tag}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={nextSlide}
                    className="absolute -right-4 z-10 w-10 h-10 bg-blue-900 hover:bg-blue-800 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Position Indicators */}
            <div className="flex justify-center gap-1.5 mt-6">
                {CLINICS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setStartIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === startIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'
                        }`}
                        aria-label={`Ir a la clínica ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

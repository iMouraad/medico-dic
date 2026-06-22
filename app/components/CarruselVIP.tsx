'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

// Función para generar un logo SVG inline (sin dependencias externas)
function makeSvgLogo(label: string, color: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="80" viewBox="0 0 150 80">
        <rect width="150" height="80" rx="10" fill="${color}"/>
        <text x="75" y="45" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Logos de clínicas y seguros (SVG inline, sin servicios externos)
const LOGOS = [
    { id: 1, name: 'Clínica San Francisco',  url: makeSvgLogo('Clínica SF',       '#0D8ABC') },
    { id: 2, name: 'Hospital Metropolitano', url: makeSvgLogo('H. Metropolitano',  '#8B5CF6') },
    { id: 3, name: 'Seguros SaludPlus',      url: makeSvgLogo('SaludPlus',         '#059669') },
    { id: 4, name: 'Clínica Santa Lucía',    url: makeSvgLogo('Santa Lucía',       '#DC2626') },
    { id: 5, name: 'Seguros Ecuasalud',      url: makeSvgLogo('Ecuasalud',         '#F59E0B') },
    { id: 6, name: 'Clínica Internacional',  url: makeSvgLogo('C. Internacional',  '#3B82F6') },
];

export default function CarruselVIP() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayLogos, setDisplayLogos] = useState(LOGOS);

    // Mezclar logos aleatoriamente al cargar
    useEffect(() => {
        const shuffled = [...LOGOS].sort(() => Math.random() - 0.5);
        setDisplayLogos(shuffled);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % displayLogos.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + displayLogos.length) % displayLogos.length);
    };

    // Avance automático cada 3 segundos
    useEffect(() => {
        const timer = setInterval(nextSlide, 3000);
        return () => clearInterval(timer);
    }, [displayLogos.length]);

    // Obtener 4 logos para renderizado rotativo
    const getVisibleLogos = () => {
        const logos = [];
        for (let i = 0; i < 4; i++) {
            const index = (currentIndex + i) % displayLogos.length;
            logos.push(displayLogos[index]);
        }
        return logos;
    };

    return (
        <div className="relative bg-white/75 backdrop-blur-md py-6 px-6 rounded-3xl border border-white/60 shadow-md">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Nuestras clínicas y seguros en convenio</span>
            </div>

            <div className="relative flex items-center justify-between">
                <button
                    onClick={prevSlide}
                    className="absolute -left-2 z-10 p-2 bg-white rounded-full border border-gray-150 shadow-xs hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <div className="flex gap-4 overflow-hidden w-full justify-center px-6">
                    {getVisibleLogos().map((logo, idx) => (
                        <div
                            key={logo.id}
                            className={`flex-shrink-0 w-32 sm:w-36 md:w-40 h-20 bg-white rounded-xl flex items-center justify-center border border-gray-100 transition-all duration-350 hover:-translate-y-1 hover:shadow-md hover:border-blue-200 ${
                                idx === 2 ? 'hidden sm:flex' : idx === 3 ? 'hidden md:flex' : 'flex'
                            }`}
                        >
                            <img
                                src={logo.url}
                                alt={logo.name}
                                className="max-w-full max-h-full object-contain p-3 opacity-70 filter grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                            />
                        </div>
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="absolute -right-2 z-10 p-2 bg-white rounded-full border border-gray-150 shadow-xs hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
            </div>

            {/* Indicadores de posición */}
            <div className="flex justify-center gap-1.5 mt-5">
                {displayLogos.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentIndex ? 'w-5 bg-blue-500' : 'w-1.5 bg-gray-250'
                        }`}
                        aria-label={`Ir al logo ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
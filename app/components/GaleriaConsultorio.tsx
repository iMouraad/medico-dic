'use client';

import { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GaleriaConsultorio({ fotos }: { fotos: string[] }) {
    const [vistaAmpliada, setVistaAmpliada] = useState(false);
    const [fotoActiva, setFotoActiva] = useState<number | null>(null);

    if (fotos.length === 0) return null;

    const preview = fotos.slice(0, 4);

    const abrirFoto = (i: number) => setFotoActiva(i);
    const cerrarFoto = () => setFotoActiva(null);
    const siguiente = () => setFotoActiva((i) => (i === null ? null : (i + 1) % fotos.length));
    const anterior = () => setFotoActiva((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length));

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Galería de mi consultorio
                </h2>
                {fotos.length > 4 && (
                    <button
                        type="button"
                        onClick={() => setVistaAmpliada(true)}
                        className="text-xs font-bold text-brand-turquoise hover:text-brand-blue transition-colors cursor-pointer"
                    >
                        Ver todas →
                    </button>
                )}
            </div>

            <div className="grid grid-cols-4 gap-2.5">
                {preview.map((url, i) => (
                    <button
                        key={url}
                        type="button"
                        onClick={() => (fotos.length > 4 ? setVistaAmpliada(true) : abrirFoto(i))}
                        className="aspect-square rounded-xl overflow-hidden border border-slate-100 cursor-pointer"
                    >
                        <img src={url} alt="Foto del consultorio" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                    </button>
                ))}
            </div>

            {/* Vista ampliada: cuadrícula con todas las fotos */}
            {vistaAmpliada && (
                <div
                    className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setVistaAmpliada(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-extrabold text-brand-blue-dark">Todas las fotos ({fotos.length})</h3>
                            <button
                                type="button"
                                onClick={() => setVistaAmpliada(false)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                            {fotos.map((url, i) => (
                                <button
                                    key={url}
                                    type="button"
                                    onClick={() => abrirFoto(i)}
                                    className="aspect-square rounded-xl overflow-hidden border border-slate-100 cursor-pointer"
                                >
                                    <img src={url} alt="Foto del consultorio" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox: una foto a tamaño completo */}
            {fotoActiva !== null && (
                <div
                    className="fixed inset-0 z-[1200] bg-slate-950/90 flex items-center justify-center p-4"
                    onClick={cerrarFoto}
                >
                    <button
                        type="button"
                        onClick={cerrarFoto}
                        aria-label="Cerrar"
                        className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {fotos.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); anterior(); }}
                            aria-label="Foto anterior"
                            className="absolute left-4 text-white/70 hover:text-white cursor-pointer"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    )}

                    <img
                        src={fotos[fotoActiva]}
                        alt="Foto del consultorio ampliada"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {fotos.length > 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); siguiente(); }}
                            aria-label="Foto siguiente"
                            className="absolute right-4 text-white/70 hover:text-white cursor-pointer"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

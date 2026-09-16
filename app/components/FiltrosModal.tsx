'use client';

import { useState } from 'react';
import { X, SlidersHorizontal, Stethoscope, MapPin, Building2, DollarSign, RefreshCw, Info } from 'lucide-react';
import AccordionFiltro from './AccordionFiltro';
import { RANGOS_PRECIO, type RangoPrecio } from '@/app/lib/types';

export interface FiltrosState {
    especialidades: string[];
    ciudades: string[];
    sectores: string[];
    precio: RangoPrecio | null;
}

interface Props {
    initial: FiltrosState;
    specialtyOptions: string[];
    cityOptions: string[];
    sectorOptions: string[];
    onApply: (filtros: FiltrosState) => void;
    onClose: () => void;
}

export default function FiltrosModal({ initial, specialtyOptions, cityOptions, sectorOptions, onApply, onClose }: Props) {
    const [draft, setDraft] = useState<FiltrosState>(initial);

    const limpiar = () => setDraft({ especialidades: [], ciudades: [], sectores: [], precio: null });

    return (
        <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-start justify-between p-5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center">
                            <SlidersHorizontal className="w-5 h-5" />
                        </span>
                        <div>
                            <h2 className="text-lg font-extrabold text-brand-blue-dark">Filtros de búsqueda</h2>
                            <p className="text-xs text-slate-400">Encuentra al especialista ideal para ti</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                    <AccordionFiltro
                        label="Especialidad"
                        hint="Selecciona una especialidad"
                        icon={Stethoscope}
                        options={specialtyOptions}
                        selected={draft.especialidades}
                        onChange={(v) => setDraft((d) => ({ ...d, especialidades: v }))}
                        searchPlaceholder="Buscar especialidad..."
                        freeTextNoun="especialidad"
                        defaultOpen
                    />

                    <AccordionFiltro
                        label="Ubicación"
                        hint="Selecciona una ciudad"
                        icon={MapPin}
                        options={cityOptions}
                        selected={draft.ciudades}
                        onChange={(v) => setDraft((d) => ({ ...d, ciudades: v }))}
                        searchPlaceholder="Buscar ciudad..."
                        freeTextNoun="ciudad"
                    />

                    <AccordionFiltro
                        label="Sector"
                        hint="Selecciona un sector (opcional)"
                        icon={Building2}
                        options={sectorOptions}
                        selected={draft.sectores}
                        onChange={(v) => setDraft((d) => ({ ...d, sectores: v }))}
                        searchPlaceholder="Buscar sector..."
                        freeTextNoun="sector"
                    />

                    <div className="flex-shrink-0 border border-slate-100 rounded-xl bg-white p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-9 h-9 rounded-full bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center flex-shrink-0">
                                <DollarSign className="w-4 h-4" />
                            </span>
                            <div>
                                <span className="block text-sm font-bold text-brand-blue-dark">Precios</span>
                                <span className="block text-xs text-slate-400">Selecciona un rango de precio</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {RANGOS_PRECIO.map((r) => (
                                <label
                                    key={r.value}
                                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                                >
                                    <input
                                        type="radio"
                                        name="precio"
                                        className="accent-[color:var(--brand-turquoise)]"
                                        checked={draft.precio === r.value}
                                        onChange={() =>
                                            setDraft((d) => ({ ...d, precio: d.precio === r.value ? null : r.value }))
                                        }
                                    />
                                    {r.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex-shrink-0 bg-page-bg/70 border border-brand-turquoise/20 rounded-xl p-4 flex items-start gap-3">
                        <Info className="w-4 h-4 text-brand-turquoise flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            <span className="font-bold text-brand-blue-dark block mb-0.5">Ningún filtro es obligatorio.</span>
                            Puedes buscar sin seleccionar filtros y ver todos los médicos disponibles.
                        </p>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-50 flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={() => onApply(draft)}
                        className="w-full flex items-center justify-center gap-2 bg-brand-turquoise hover:brightness-95 text-white font-bold text-sm py-3.5 rounded-xl transition duration-200 cursor-pointer active:scale-98"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Aplicar filtros
                    </button>
                    <button
                        type="button"
                        onClick={limpiar}
                        className="w-full flex items-center justify-center gap-2 text-brand-blue font-bold text-sm py-2 cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Limpiar filtros
                    </button>
                </div>
            </div>
        </div>
    );
}

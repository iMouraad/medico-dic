'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Check, Plus } from 'lucide-react';

interface Props {
    label: string;
    hint: string;
    icon: React.ComponentType<{ className?: string }>;
    options: string[];
    selected: string[];
    onChange: (next: string[]) => void;
    searchPlaceholder?: string;
    freeTextNoun: string; // ej. "especialidad", "ciudad", "sector"
    defaultOpen?: boolean;
}

export default function AccordionFiltro({
    label,
    hint,
    icon: Icon,
    options,
    selected,
    onChange,
    searchPlaceholder = 'Buscar...',
    freeTextNoun,
    defaultOpen = false,
}: Props) {
    const [open, setOpen] = useState(defaultOpen);
    const [term, setTerm] = useState('');

    // Filtrado incremental: acota la lista letra por letra, sin botón de
    // buscar ni requerir la palabra completa.
    const filtered = options.filter((o) => o.toLowerCase().includes(term.toLowerCase()));

    const exactMatch = options.some((o) => o.toLowerCase() === term.trim().toLowerCase());
    const showFreeTextOption = term.trim().length > 0 && !exactMatch;

    const toggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((v) => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const addFreeText = () => {
        const value = term.trim();
        if (!value || selected.includes(value)) return;
        onChange([...selected, value]);
        setTerm('');
    };

    return (
        <div className="flex-shrink-0 border border-slate-100 rounded-xl overflow-hidden bg-white">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
            >
                <span className="w-9 h-9 rounded-full bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-brand-blue-dark">{label}</span>
                    <span className="block text-xs text-slate-400">
                        {selected.length > 0 ? selected.join(', ') : hint}
                    </span>
                </span>
                {open ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
            </button>

            {open && (
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 mb-2 bg-slate-50/50">
                        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full text-sm bg-transparent outline-none border-none text-slate-700 placeholder-slate-400"
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
                        {filtered.map((option) => {
                            const isSelected = selected.includes(option);
                            return (
                                <label
                                    key={option}
                                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                                >
                                    <span
                                        className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${
                                            isSelected
                                                ? 'bg-brand-turquoise border-brand-turquoise'
                                                : 'border-slate-300'
                                        }`}
                                    >
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isSelected}
                                        onChange={() => toggle(option)}
                                    />
                                    <span className="text-sm text-slate-700">{option}</span>
                                </label>
                            );
                        })}
                        {filtered.length === 0 && !showFreeTextOption && (
                            <p className="text-xs text-slate-400 text-center py-3">Sin coincidencias</p>
                        )}
                    </div>

                    {showFreeTextOption && (
                        <button
                            type="button"
                            onClick={addFreeText}
                            className="mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-brand-turquoise/40 text-brand-turquoise text-xs font-bold hover:bg-brand-turquoise/5 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Usar &quot;{term.trim()}&quot; como {freeTextNoun}
                        </button>
                    )}

                    {selected.filter((s) => !options.includes(s)).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {selected
                                .filter((s) => !options.includes(s))
                                .map((s) => (
                                    <span
                                        key={s}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-brand-turquoise/10 text-brand-turquoise px-2.5 py-1 rounded-full"
                                    >
                                        {s}
                                        <button type="button" onClick={() => toggle(s)} className="cursor-pointer">
                                            ×
                                        </button>
                                    </span>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

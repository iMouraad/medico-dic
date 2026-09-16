'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

interface CustomDropdownProps {
    label: string;
    options: string[];
    selected: string;
    onChange: (value: string) => void;
    icon: React.ComponentType<{ className?: string }>;
    searchPlaceholder?: string;
}

export default function CustomDropdown({
    label,
    options,
    selected,
    onChange,
    icon: Icon,
    searchPlaceholder = 'Buscar...'
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cierra el desplegable y reinicia el término de búsqueda a la vez, para
    // no depender de un efecto que sincronice searchTerm con isOpen.
    const closeDropdown = () => {
        setIsOpen(false);
        setSearchTerm('');
    };

    // Cerrar el menú al hacer clic fuera de él
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative flex-1" ref={dropdownRef}>
            {/* Botón Disparador */}
            <button
                type="button"
                onClick={() => (isOpen ? closeDropdown() : setIsOpen(true))}
                className={`w-full flex items-center justify-between pl-4 pr-3.5 py-3 border rounded-xl text-left bg-white transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isOpen 
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10' 
                        : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 shadow-xs'
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isOpen ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span className={`truncate text-sm font-medium ${selected ? 'text-slate-800' : 'text-slate-400'}`}>
                        {selected || label}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                    {selected && (
                        <span 
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </div>
            </button>

            {/* Menú Desplegable */}
            {isOpen && (
                <div className="absolute z-[70] w-full mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl overflow-hidden origin-top scale-100 opacity-100 transition-all duration-200">
                    {/* Buscador Interno */}
                    <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/30">
                        <Search className="w-3.5 h-3.5 text-slate-400 ml-2 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full text-xs font-medium bg-transparent border-none outline-none py-1.5 pr-2 text-slate-700 placeholder-slate-400"
                            autoFocus
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-650 mr-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Lista de Opciones */}
                    <ul className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50/40 scrollbar-thin">
                        <li className="hidden"></li>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = selected === option;
                                return (
                                    <li key={option}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onChange(option);
                                                closeDropdown();
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                                                isSelected
                                                    ? 'bg-blue-50/70 text-blue-700 font-semibold'
                                                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-800'
                                            }`}
                                        >
                                            <span className="truncate">{option}</span>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                                        </button>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-4 py-4 text-center text-xs text-slate-400 font-medium">
                                No se encontraron resultados
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

'use client';

import { useLayoutEffect, useRef, useState } from 'react';

export default function BioTruncada({ texto }: { texto: string }) {
    const ref = useRef<HTMLParagraphElement>(null);
    const [expandido, setExpandido] = useState(false);
    const [necesitaToggle, setNecesitaToggle] = useState(false);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Si el texto sin recortar ocupa más alto que su versión a 3 líneas,
        // es que se está cortando y hace falta el botón "Ver más".
        setNecesitaToggle(el.scrollHeight > el.clientHeight + 1);
    }, [texto]);

    return (
        <div>
            <p
                ref={ref}
                className={`text-sm text-slate-600 leading-relaxed ${expandido ? '' : 'line-clamp-3'}`}
            >
                {texto}
            </p>
            {necesitaToggle && (
                <button
                    type="button"
                    onClick={() => setExpandido((v) => !v)}
                    className="mt-1.5 text-xs font-bold text-brand-turquoise hover:text-brand-blue transition-colors cursor-pointer"
                >
                    {expandido ? 'Ver menos' : 'Ver más'}
                </button>
            )}
        </div>
    );
}

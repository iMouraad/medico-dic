'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import type { Doctor } from '@/app/lib/types';
import MensajeContactoModal from './MensajeContactoModal';

export default function EnviarMensajeLink({ doctor }: { doctor: Doctor }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue transition-colors cursor-pointer"
            >
                <Mail className="w-3.5 h-3.5" />
                ¿Prefieres escribir? Enviar mensaje
            </button>

            {open && <MensajeContactoModal doctor={doctor} onClose={() => setOpen(false)} />}
        </>
    );
}

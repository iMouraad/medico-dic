'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import CrearUsuarioModal from './CrearUsuarioModal';

export default function AccionesRapidasAdmin() {
    const [modalAbierto, setModalAbierto] = useState(false);

    return (
        <>
            <button
                onClick={() => setModalAbierto(true)}
                className="flex items-center gap-2 bg-brand-blue-dark hover:opacity-90 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
                <UserPlus className="w-4 h-4" />
                Crear usuario
            </button>

            {modalAbierto && <CrearUsuarioModal onClose={() => setModalAbierto(false)} />}
        </>
    );
}

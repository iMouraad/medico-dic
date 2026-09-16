// Favoritos del paciente — sin cuentas ni login, guardado en el dispositivo.
// Ver NeosDoc_Especificacion_Menu_Filtros_Tarjeta: "se guarda en
// almacenamiento local del dispositivo, sin necesidad de cuenta ni login".
// Si el usuario reinstala la app o cambia de dispositivo, pierde sus
// favoritos: limitación aceptada del modelo sin cuentas.

import { useSyncExternalStore } from 'react';

const KEY = 'neosdoc_favoritos';

// Suscriptores para useSyncExternalStore: así un cambio de favorito en una
// tarjeta se refleja al instante en cualquier otra que muestre el mismo
// médico, sin leer localStorage dentro de un efecto (evita el patrón de
// "setState síncrono en efecto" y el parpadeo de hidratación).
const listeners = new Set<() => void>();

function emitChange() {
    listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function leer(): number[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
        return [];
    }
}

function guardar(ids: number[]) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
        // almacenamiento no disponible (modo privado, cuota llena, etc.) — no bloquea la app
    }
}

export function getFavoritos(): number[] {
    return leer();
}

export function esFavorito(id: number): boolean {
    return leer().includes(id);
}

export function toggleFavorito(id: number): boolean {
    const actuales = leer();
    const yaEsta = actuales.includes(id);
    const siguiente = yaEsta ? actuales.filter((f) => f !== id) : [...actuales, id];
    guardar(siguiente);
    emitChange();
    return !yaEsta;
}

// Hook para usar en componentes: siempre arranca en `false` en el snapshot
// del servidor (no hay localStorage ahí) y se actualiza solo tras montar,
// sin necesidad de un useEffect que llame a setState directamente.
export function useEsFavorito(id: number): boolean {
    return useSyncExternalStore(
        subscribe,
        () => esFavorito(id),
        () => false
    );
}

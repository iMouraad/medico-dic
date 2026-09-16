// Formateo de fecha/hora en español hecho a mano (sin Intl/toLocaleString).
//
// Node (servidor) y los navegadores usan versiones de ICU distintas, así
// que `toLocaleString('es-EC', ...)` puede producir el mismo texto visible
// pero con un carácter de espacio distinto alrededor de "a. m."/"p. m."
// (espacio normal vs. espacio angosto sin separación). React detecta esa
// diferencia byte a byte durante la hidratación y falla, aunque a simple
// vista el texto se vea idéntico. Generar el string nosotros mismos evita
// el problema de raíz en vez de solo silenciar la advertencia.

const MESES_LARGO = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatHora(date: Date): string {
    let h = date.getHours();
    const m = date.getMinutes();
    const sufijo = h < 12 ? 'a. m.' : 'p. m.';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${String(m).padStart(2, '0')} ${sufijo}`;
}

export function formatFechaLarga(date: Date): string {
    return `${date.getDate()} de ${MESES_LARGO[date.getMonth()]} de ${date.getFullYear()}`;
}

export function formatFechaCorta(date: Date): string {
    return `${date.getDate()} ${MESES_CORTO[date.getMonth()]}`;
}

export function formatFechaHora(date: Date): string {
    return `${date.getDate()} ${MESES_CORTO[date.getMonth()]} ${date.getFullYear()}, ${formatHora(date)}`;
}

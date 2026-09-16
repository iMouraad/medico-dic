// Flags on/off para features que ya tienen su lógica lista pero se
// mantienen ocultas hasta que el negocio decida activarlas (ver
// documento de requerimientos NEOSDOC, sección "Carrusel").
export const FEATURES = {
    carruselVIP: process.env.NEXT_PUBLIC_FEATURE_CARRUSEL === 'true',
};

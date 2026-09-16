'use client';

import MapaPublicoCliente from './MapaPublicoCliente';
import type { DoctorPin } from './MapaMedicos';

export default function UbicacionMapaCliente({ doctor }: { doctor: DoctorPin }) {
    return <MapaPublicoCliente doctors={[doctor]} height={320} />;
}

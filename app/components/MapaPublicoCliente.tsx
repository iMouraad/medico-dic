'use client';

import dynamic from 'next/dynamic';
import type { DoctorPin } from './MapaMedicos';

const MapaMedicos = dynamic(() => import('./MapaMedicos'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[560px] bg-slate-100 rounded-3xl border border-slate-100 animate-pulse" />
    ),
});

export default function MapaPublicoCliente({ doctors, height = 560 }: { doctors: DoctorPin[]; height?: number }) {
    return <MapaMedicos hideHeading height={height} doctors={doctors} />;
}

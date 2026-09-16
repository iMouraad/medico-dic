'use client';

import dynamic from 'next/dynamic';

const UbicacionMapaPicker = dynamic(() => import('./UbicacionMapaPicker'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[320px] bg-slate-100 rounded-2xl border border-slate-100 animate-pulse" />
    ),
});

export default UbicacionMapaPicker;

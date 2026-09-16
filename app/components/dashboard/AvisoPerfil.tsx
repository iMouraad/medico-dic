import Link from 'next/link';
import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import type { Doctor } from '@/app/lib/types';

// Campos que un paciente necesita ver sí o sí en el perfil público para que
// valga la pena publicarlo. Si falta alguno, avisamos al médico en su
// dashboard en vez de dejar que lo descubra al ver su perfil vacío.
function camposFaltantes(doctor: Doctor): string[] {
    const faltantes: string[] = [];
    if (!doctor.name) faltantes.push('Nombre completo');
    if (!doctor.specialty) faltantes.push('Especialidad');
    if (!doctor.city) faltantes.push('Ciudad');
    if (!doctor.whatsapp) faltantes.push('WhatsApp');
    if (!doctor.bio) faltantes.push('Biografía');
    if (!doctor.profile_photo_url) faltantes.push('Foto de perfil');
    return faltantes;
}

export default function AvisoPerfil({ doctor }: { doctor: Doctor | null }) {
    if (!doctor) return null;

    if (doctor.status === 'rechazado') {
        return (
            <Link
                href="/dashboard/perfil"
                className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6 hover:bg-red-100/60 transition-colors group"
            >
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-red-700">Tu perfil fue rechazado</p>
                    <p className="text-xs text-red-500">Revisa y actualiza tus datos para volver a enviarlo a revisión.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </Link>
        );
    }

    const faltantes = camposFaltantes(doctor);
    if (faltantes.length === 0) return null;

    return (
        <Link
            href="/dashboard/perfil"
            className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-6 hover:bg-amber-100/60 transition-colors group"
        >
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-700">Completa tu perfil para publicarlo</p>
                <p className="text-xs text-amber-600 truncate">Falta: {faltantes.join(', ')}.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </Link>
    );
}

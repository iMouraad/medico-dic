export interface Doctor {
    id: number;
    user_id: string | null;
    ruc: string | null;
    name: string | null;
    specialty: string | null;
    city: string | null;
    address: string | null;
    consultation_price: number | null;
    whatsapp: string | null;
    email: string | null;
    plan: string | null;
    profile_photo_url: string | null;
    modalities: string[] | null;
    verified_senescyt: boolean | null;
    status: 'pendiente' | 'aprobado' | 'rechazado';
    certificado_url: string | null;
    bio: string | null;
    ofrece_descuento: boolean;
    descuento_porcentaje: number | null;
    acepta_ofertas_comerciales: boolean;
    profile_views: number;
    appointment_clicks: number;
    whatsapp_clicks: number;
}

export const MODALIDADES_DISPONIBLES = ['Presencial', 'Virtual', 'A domicilio'];

export const STATUS_LABEL: Record<Doctor['status'], { label: string; className: string }> = {
    pendiente: { label: 'Pendiente de revisión', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    aprobado: { label: 'Aprobado y publicado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rechazado: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200' },
};

export interface Appointment {
    id: number;
    doctor_id: number;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    reason: string | null;
    preferred_at: string;
    status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
    created_at: string;
    updated_at: string;
}

export const APPOINTMENT_STATUS_LABEL: Record<Appointment['status'], { label: string; className: string }> = {
    pendiente: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmada: { label: 'Confirmada', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    completada: { label: 'Completada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelada: { label: 'Cancelada', className: 'bg-red-50 text-red-700 border-red-200' },
};

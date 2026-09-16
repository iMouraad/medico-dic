export interface Doctor {
    id: number;
    user_id: string | null;
    ruc: string | null;
    name: string | null;
    username: string | null;
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
    duracion_consulta_minutos: number;
    horario_atencion: HorarioAtencion;
    latitude: number | null;
    longitude: number | null;
    sector: string | null;
    galeria_urls: string[];
    formacion_universidad: string | null;
    formacion_titulo: string | null;
    formacion_anio_inicio: number | null;
    formacion_anio_fin: number | null;
    idiomas: string | null;
    idiomas_nivel: string | null;
    areas_interes: string[];
}

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface HorarioDia {
    activo: boolean;
    inicio: string;
    fin: string;
}

export type HorarioAtencion = Record<DiaSemana, HorarioDia>;

export const DIAS_SEMANA_KEYS: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const DIAS_SEMANA_LABEL: Record<DiaSemana, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo',
};

export const HORARIO_ATENCION_DEFAULT: HorarioAtencion = {
    lunes: { activo: true, inicio: '08:00', fin: '17:00' },
    martes: { activo: true, inicio: '08:00', fin: '17:00' },
    miercoles: { activo: true, inicio: '08:00', fin: '17:00' },
    jueves: { activo: true, inicio: '08:00', fin: '17:00' },
    viernes: { activo: true, inicio: '08:00', fin: '17:00' },
    sabado: { activo: false, inicio: '08:00', fin: '13:00' },
    domingo: { activo: false, inicio: '08:00', fin: '13:00' },
};

export interface DiaBloqueado {
    id: number;
    doctor_id: number;
    fecha: string;
    motivo: string | null;
    created_at: string;
}

// Insignia "Médico Fundador": los primeros N médicos registrados (por orden
// de id, que es secuencial) la conservan para siempre como reconocimiento
// por unirse temprano a la plataforma.
export const FOUNDER_LIMIT = 50;

export const MODALIDADES_DISPONIBLES = ['Presencial', 'Virtual', 'A domicilio'];

export const SECTORES_ESTABLECIMIENTO = [
    'Clínica privada',
    'Hospital',
    'Consultorio particular',
    'Centro médico',
    'Otro',
];

export type RangoPrecio = '$' | '$$' | '$$$' | 'no_especificado';

export const RANGOS_PRECIO: { value: RangoPrecio; label: string; test: (price: number | null) => boolean }[] = [
    { value: '$', label: '$ · Hasta $20', test: (p) => p != null && p <= 20 },
    { value: '$$', label: '$$ · $21 a $50', test: (p) => p != null && p > 20 && p <= 50 },
    { value: '$$$', label: '$$$ · Más de $50', test: (p) => p != null && p > 50 },
    { value: 'no_especificado', label: 'No especificado', test: (p) => p == null },
];

export const CIUDADES_ECUADOR = [
    'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán',
    'Manta', 'Portoviejo', 'Loja', 'Ambato', 'Esmeraldas', 'Quevedo',
    'Riobamba', 'Milagro', 'Ibarra', 'La Libertad', 'Babahoyo', 'Sangolquí',
    'Latacunga', 'Tulcán', 'Nueva Loja', 'Azogues', 'Chone', 'Pasaje',
    'Daule', 'Otavalo', 'Cayambe', 'Salinas', 'Ventanas', 'Playas',
    'Jipijapa', 'Huaquillas', 'El Carmen', 'Santa Elena', 'Guaranda',
    'Puyo', 'Macas', 'Tena', 'Zamora', 'El Coca',
];

export const STATUS_LABEL: Record<Doctor['status'], { label: string; className: string }> = {
    pendiente: { label: 'Pendiente de revisión', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    aprobado: { label: 'Aprobado y publicado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rechazado: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200' },
};

export interface Appointment {
    id: number;
    doctor_id: number;
    patient_name: string;
    patient_email: string | null;
    patient_phone: string | null;
    patient_cedula: string | null;
    reason: string | null;
    preferred_at: string;
    duration_minutes: number;
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

export interface ActivityStreak {
    doctor_id: number;
    semana_actual: string;
    dias_activos: string[];
    dias_activos_esta_semana: number;
    racha_actual: number;
    mejor_racha: number;
    ultima_actividad: string | null;
    updated_at: string;
}

export interface Ad {
    id: number;
    title: string;
    image_url: string | null;
    link_url: string | null;
    tipo: 'imagen' | 'banner' | 'texto';
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: 'activo' | 'pausado' | 'finalizado';
    creado_por: string | null;
    created_at: string;
}

export interface ContactMessage {
    id: number;
    doctor_id: number;
    email: string;
    whatsapp_paciente: string | null;
    mensaje: string;
    leido: boolean;
    created_at: string;
}

// Fase 2 (no se construye UI todavía) — ver migración 0017.
export interface SocioComercial {
    id: number;
    nombre: string;
    tipo_producto: string | null;
    mecanismo_cobro: 'tarifa_fija' | 'comision_venta' | 'pay_per_lead';
    codigo_referido: string;
    contacto_nombre: string | null;
    contacto_email: string | null;
    activo: boolean;
    notas: string | null;
    created_at: string;
}

export interface SocioMedicoBeneficio {
    id: number;
    socio_id: number;
    doctor_id: number;
    descripcion: string | null;
    created_at: string;
}

export interface Specialty {
    id: number;
    name: string;
    created_at: string;
}

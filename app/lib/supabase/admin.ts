import { createClient } from '@supabase/supabase-js';

// Cliente con la service role key: se salta RLS por completo. SOLO se debe
// importar desde código de servidor (API routes), nunca desde un componente
// 'use client' — la key no debe llegar jamás al navegador.
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

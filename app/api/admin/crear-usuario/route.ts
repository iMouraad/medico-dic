import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const nombreCompleto = typeof body.nombreCompleto === 'string' ? body.nombreCompleto.trim() : '';
    const rol = body.rol === 'admin' ? 'admin' : 'medico';

    if (!email || !nombreCompleto) {
        return NextResponse.json({ error: 'Nombre y correo son obligatorios.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const origin = request.nextUrl.origin;

    // Se manda una invitación: el usuario elige su propia contraseña al
    // abrir el enlace (mismo paso que /registro/completar), nunca la
    // creamos ni la vemos nosotros.
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { nombre_completo: nombreCompleto },
        redirectTo: `${origin}/registro/completar`,
    });

    if (inviteError || !invited.user) {
        const yaExiste = inviteError?.message?.toLowerCase().includes('already registered');
        return NextResponse.json(
            { error: yaExiste ? 'Ya existe una cuenta con ese correo.' : 'No se pudo crear el usuario.' },
            { status: 400 }
        );
    }

    if (rol === 'admin') {
        // Update directo con el cliente de service role: no pasa por RLS, así
        // que el trigger de auditoría no ve auth.uid() del admin que actúa
        // (no hay sesión en este cliente). Se registra el evento a mano.
        await admin.from('profiles').update({ role: 'admin' }).eq('id', invited.user.id);
    }

    await admin.from('audit_log').insert({
        actor_id: user.id,
        actor_email: user.email,
        action: 'crear_usuario',
        target_type: 'profiles',
        target_id: invited.user.id,
        detalle: `Creó la cuenta de ${nombreCompleto} (${email}) con rol ${rol}`,
    });

    return NextResponse.json({ ok: true });
}

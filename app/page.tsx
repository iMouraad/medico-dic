import { redirect } from 'next/navigation';
import { supabase } from './lib/supabaseClient';
import { createClient as createServerClient } from './lib/supabase/server';
import MainPage from './components/MainPage';
import type { Ad, Specialty } from './lib/types';

export default async function Home() {
  // Los médicos y admins logueados no ven la landing pública: van directo
  // a su propio dashboard.
  const serverSupabase = await createServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (user) {
    const { data: profile } = await serverSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    redirect(profile?.role === 'admin' ? '/admin' : '/dashboard');
  }

  // Obtener todos los médicos
  const { data: doctors, error } = await supabase.from('doctors').select('*');

  const { data: ads } = await supabase
    .from('ads')
    .select('*')
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: specialties } = await supabase.from('specialties').select('*').order('name', { ascending: true });

  if (error) {
    console.error('Error de Supabase:', error);
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-md text-center max-w-md">
          <div className="text-red-500 text-3xl mb-2">⚠️</div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Error de Conexión</h2>
          <p className="text-sm text-slate-500 mb-4">No se pudo establecer conexión con la base de datos de Supabase.</p>
          <p className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
            {error.message || 'Verifica las credenciales y estado del servidor.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <MainPage
      doctors={doctors || []}
      ads={(ads as Ad[]) ?? []}
      specialtyCatalog={(specialties as Specialty[]) ?? []}
    />
  );
}
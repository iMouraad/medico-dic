import { supabase } from './lib/supabaseClient';
import CarruselVIP from './components/CarruselVIP';
import TarjetaMedico from './components/TarjetaMedico';
import ListaMedicos from './components/ListaMedicos';
import { Star } from 'lucide-react';

export default async function Home() {
  // Obtener todos los médicos
  const { data: doctors, error } = await supabase.from('doctors').select('*');

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

  if (!doctors || doctors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md text-center max-w-md">
          <div className="text-slate-450 text-3xl mb-2">🔍</div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Sin Médicos</h2>
          <p className="text-sm text-slate-500">No se encontraron profesionales de la salud registrados en la plataforma.</p>
        </div>
      </div>
    );
  }

  // Médicos destacados (plan "Destacado") y mezclarlos aleatoriamente
  const destacados = doctors
    .filter((d) => d.plan === 'Destacado')
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <main className="relative min-h-screen bg-slate-50/30 overflow-hidden pb-16">
      {/* Orbes Ambientales de Luz (Diseño de Ensueño) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-ambient-1" />
      <div className="absolute top-[20%] right-[-15%] w-[45vw] h-[45vw] bg-indigo-400/8 rounded-full blur-[120px] pointer-events-none animate-ambient-2" />
      <div className="absolute bottom-[20%] left-[-15%] w-[40vw] h-[40vw] bg-emerald-400/6 rounded-full blur-[100px] pointer-events-none animate-ambient-3" />

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        {/* Header Hero Section */}
        <header className="text-center mb-12">
          {/* Badge Oficial */}
          <div className="inline-flex items-center gap-1.5 bg-blue-50/80 border border-blue-100/60 text-blue-700 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-5 shadow-2xs">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse-dot" />
            <span>Directorio Médico Oficial de Ecuador</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800 mb-4 max-w-3xl mx-auto leading-tight md:leading-[1.15]">
            Encuentra especialistas médicos <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">verificados por SENESCYT</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Conectamos pacientes con profesionales de la salud certificados en Ecuador. Transparencia, seguridad y agendamiento directo.
          </p>
        </header>

        {/* Carrusel VIP */}
        <section className="mb-12">
          <CarruselVIP />
        </section>

        {/* Médicos Destacados */}
        {destacados.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-extrabold text-slate-800 mb-5 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Médicos Destacados</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200/40 px-2.5 py-0.5 rounded-full ml-1 tracking-wider uppercase">
                Recomendados
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {destacados.map((doctor) => (
                <TarjetaMedico key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </section>
        )}

        {/* Todos los médicos con buscador */}
        <section>
          <h2 className="text-xl font-extrabold text-slate-800 mb-5">
            Todos los médicos
          </h2>
          <ListaMedicos doctors={doctors} />
        </section>
      </div>
    </main>
  );
}
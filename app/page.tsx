import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6 flex flex-col justify-center min-h-[80vh]">
      
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
        Hola, soy <span className="text-blue-500">Toni</span>.
        <br />
        Especialista en <span className="underline decoration-blue-500">Ciberseguridad</span>.
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Especialista en Ciberseguridad con ADN de sistemas e infraestructura. Mi paso por
          BBVA Technology gestionando activos críticos me ha dado una visión pragmática: la
          seguridad no es solo encontrar vulnerabilidades, sino entender el impacto real en el
          negocio y garantizar la continuidad operativa.      
      </p>

      <div className="flex flex-wrap gap-4">
        {/* Botón Principal */}
        <Link 
          href="/writeups" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          Leer mis Write-ups
        </Link>
        
        {/* Botón Secundario */}
        <Link 
          href="/cv" 
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-gray-200 dark:border-gray-800"
        >
          Ver mi Currículum
        </Link>
      </div>

    </main>
  );
}
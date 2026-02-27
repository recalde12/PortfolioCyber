import Link from 'next/link';

export default function CVPage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      
      {/* Cabecera con título y botón de descarga */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mi Currículum
        </h1>
        
        {/* Botón de Descarga directa */}
        <a 
          href="/cv.pdf" 
          download="Toni_CV_Ciberseguridad.pdf"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          {/* Icono de descarga en formato SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Descargar PDF
        </a>
      </div>

      {/* Visor del PDF integrado en la web */}
      <div className="w-full h-[800px] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 shadow-sm">
        <iframe 
          src="/cv.pdf" 
          className="w-full h-full"
          title="Currículum Vitae Toni"
        />
      </div>

    </main>
  );
}
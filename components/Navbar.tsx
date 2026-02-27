import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo / Nombre */}
        <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
          Toni<span className="text-blue-500">Sec</span>
        </Link>
        
        {/* Enlaces de navegación */}
        <div className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link href="/" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Inicio
          </Link>
          <Link href="/writeups" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Write-ups
          </Link>
          <Link href="/cv" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            Currículum
          </Link>
        </div>

      </div>
    </nav>
  );
}
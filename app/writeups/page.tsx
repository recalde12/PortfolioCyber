import Link from 'next/link';
import { getAllWriteups } from '@/lib/markdown'; // Asegúrate de que la ruta sea correcta

export default function WriteupsPage() {
  const writeups = getAllWriteups();

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Write-ups & Investigaciones
      </h1>
      
      <div className="grid gap-6">
        {writeups.map((writeup) => (
          <Link href={`/writeups/${writeup.slug}`} key={writeup.slug}>
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-white dark:bg-gray-950">
              
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {writeup.title}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  writeup.difficulty === 'Fácil' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  writeup.difficulty === 'Media' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {writeup.difficulty}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {writeup.date} • {writeup.os}
              </p>
              
              <p className="text-gray-700 dark:text-gray-300">
                {writeup.description}
              </p>
              
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
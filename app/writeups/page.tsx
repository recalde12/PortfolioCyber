import { getAllWriteups } from '@/lib/markdown';
import WriteupsList from '@/components/WriteupsList';

export default function WriteupsPage() {
  // Esta función se ejecuta en el servidor (Vercel lo permite aquí)
  const allWriteups = getAllWriteups();

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white text-center">
        Mis Write-ups
      </h1>
      <p className="text-gray-500 text-center mb-10">
        Documentación técnica de máquinas resueltas.
      </p>

      {/* Pasamos los datos al componente de cliente */}
      <WriteupsList allWriteups={allWriteups} />
    </main>
  );
}
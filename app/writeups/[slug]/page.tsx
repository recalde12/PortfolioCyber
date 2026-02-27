import { getWriteupBySlug } from '@/lib/markdown';
import { MDXRemote } from 'next-mdx-remote/rsc'; // Usamos la versión de Server Components
import Link from 'next/link';

// En Next.js App Router moderno, los params son una Promesa
export default async function WriteupPost({ params }: { params: Promise<{ slug: string }> }) {
  // Resolvemos la URL actual
  const resolvedParams = await params;
  
  // Buscamos el contenido del Markdown específico
  const writeup = getWriteupBySlug(resolvedParams.slug);

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      
      {/* Botón de volver */}
      <Link href="/writeups" className="text-blue-500 hover:underline mb-8 inline-block font-medium">
        &larr; Volver a todos los Write-ups
      </Link>

      {/* Cabecera del Write-up */}
      <div className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {writeup.title}
        </h1>
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>📅 {writeup.date}</span>
          <span>💻 OS: {writeup.os}</span>
          <span>🔥 Dificultad: {writeup.difficulty}</span>
        </div>
      </div>

      {/* Contenido del Markdown con estilos de tipografía */}
      <article className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none">
        <MDXRemote source={writeup.content} />
      </article>
      
    </main>
  );
}
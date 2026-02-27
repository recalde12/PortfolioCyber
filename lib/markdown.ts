import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Le indicamos dónde están nuestros archivos .md
const writeupsDirectory = path.join(process.cwd(), 'content/writeups');

// Función 1: Obtiene TODOS los write-ups para la lista principal
export function getAllWriteups() {
  const fileNames = fs.readdirSync(writeupsDirectory);

  const allWriteups = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(writeupsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      // SALVAVIDAS: Si no hay título en el .md, usamos el nombre del archivo
      title: data.title || slug, 
      date: data.date || 'Sin fecha',
      description: data.description || 'Sin descripción.',
      difficulty: data.difficulty || 'Desconocida',
      os: data.os || 'Desconocido',
      tags: data.tags || [],
    };
  });

  // Los ordenamos por fecha (del más nuevo al más antiguo)
  return allWriteups.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Función 2: Obtiene UN SOLO write-up para leerlo por completo
export function getWriteupBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug); 
  
  const fullPath = path.join(writeupsDirectory, `${decodedSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  // 🪄 MAGIA PARA OBSIDIAN: 
  const contentWithFixedImages = content.replace(
    /!\[\[(.*?)\]\]/g, 
    (match, imageName) => {
      const encodedImageName = encodeURIComponent(imageName);
      return `![${imageName}](/images/${encodedImageName})`;
    }
  );

  return {
    slug,
    content: contentWithFixedImages,
    // SALVAVIDAS: Si no hay título en el .md, usamos el nombre del archivo
    title: data.title || decodedSlug,
    date: data.date || 'Sin fecha',
    description: data.description || '',
    difficulty: data.difficulty || 'Desconocida',
    os: data.os || 'Desconocido',
    tags: data.tags || [],
  };
}
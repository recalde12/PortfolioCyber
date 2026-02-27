import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const writeupsDirectory = path.join(process.cwd(), 'content/writeups');

export function getAllWriteups() {
  const fileNames = fs.readdirSync(writeupsDirectory);

  const allWriteups = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(writeupsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title || slug,
      platform: data.platform || 'HackTheBox', // Valor por defecto si olvidas ponerlo
      date: data.date || 'Sin fecha',
      description: data.description || 'Sin descripción.',
      difficulty: data.difficulty || 'Desconocida',
      os: data.os || 'Desconocido',
      tags: data.tags || [],
    };
  });

  return allWriteups.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getWriteupBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug); 
  const fullPath = path.join(writeupsDirectory, `${decodedSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

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
    title: data.title || decodedSlug,
    platform: data.platform || 'HackTheBox',
    date: data.date || 'Sin fecha',
    description: data.description || '',
    difficulty: data.difficulty || 'Desconocida',
    os: data.os || 'Desconocido',
    tags: data.tags || [],
  };
}
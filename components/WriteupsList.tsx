"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function WriteupsList({ allWriteups }: { allWriteups: any[] }) {
  // El estado lo mantenemos con un nombre legible
  const [selectedPlatform, setSelectedPlatform] = useState('HackTheBox');
  const platforms = ["Hackthebox", "Vulnhub"];

  // 🛡️ Filtro blindado: pasamos ambos a minúsculas para comparar
  const filteredWriteups = allWriteups.filter(w => 
    w.platform.toLowerCase() === selectedPlatform.toLowerCase()
  );

  return (
    <>
      <div className="flex justify-center gap-4 mb-12">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
              selectedPlatform === platform
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105"
                : "bg-transparent border-gray-200 dark:border-gray-800 text-gray-500 hover:border-blue-500"
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredWriteups.map((writeup) => (
          <Link 
            href={`/writeups/${writeup.slug}`} 
            key={writeup.slug}
            className="group block p-6 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-500 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold group-hover:text-blue-500 transition-colors">
                {writeup.title}
              </h3>
              <span className="text-sm font-mono text-gray-400">{writeup.date}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {writeup.description}
            </p>
            <div className="flex gap-3">
              <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                {writeup.difficulty}
              </span>
              <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded">
                {writeup.os}
              </span>
            </div>
          </Link>
        ))}

        {filteredWriteups.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400">
            No se han encontrado máquinas de {selectedPlatform}. <br/>
            <span className="text-xs">Revisa que el archivo .md tenga platform: "{selectedPlatform}"</span>
          </div>
        )}
      </div>
    </>
  );
}
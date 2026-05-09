import React, { useEffect, useState } from 'react';
import { PlexAPI } from '../lib/plex';
import { Film, Tv, Library, ChevronRight } from 'lucide-react';

export function LibrarySelect({ api, onSelect }: { api: PlexAPI, onSelect: (lib: any) => void }) {
  const [libraries, setLibraries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLibraries()
      .then(libs => {
        // Only allow movie and show types for now
        setLibraries(libs.filter((l: any) => l.type === 'movie' || l.type === 'show'));
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch libraries');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [api]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Select a Library</h2>
        <p className="text-gray-400 mt-2">Choose a library to scan for duplicate video files.</p>
      </div>

      {isLoading ? (
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-24 bg-[#111] border border-[#222] rounded-lg"></div>
            <div className="h-24 bg-[#111] border border-[#222] rounded-lg"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 text-red-400 rounded border border-red-900/50">
          {error}
        </div>
      ) : libraries.length === 0 ? (
        <div className="p-8 text-center bg-[#111] rounded-lg border border-[#222]">
          <Library className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-300">No compatible libraries found</h3>
          <p className="text-sm text-gray-500">Only Movie and TV Show libraries are supported.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libraries.map(lib => (
            <button
              key={lib.key}
              onClick={() => onSelect(lib)}
              className="flex items-start text-left p-5 bg-[#111] border border-[#222] rounded-lg hover:border-[#333] hover:bg-[#151515] transition-all group"
            >
              <div className="p-3 bg-[#222] border border-[#333] rounded group-hover:bg-[#e5a00d]/10 group-hover:border-[#e5a00d]/30 transition-colors shrink-0">
                {lib.type === 'movie' ? (
                  <Film className="w-6 h-6 text-gray-500 group-hover:text-[#e5a00d]" />
                ) : (
                  <Tv className="w-6 h-6 text-gray-500 group-hover:text-[#e5a00d]" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-base font-medium text-white">{lib.title}</h3>
                <p className="mt-1 text-xs text-gray-500 uppercase tracking-widest">{lib.type} Library</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#e5a00d] self-center ml-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

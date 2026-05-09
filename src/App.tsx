import React, { useState } from 'react';
import { PlexAPI } from './lib/plex';
import { Setup } from './components/Setup';
import { LibrarySelect } from './components/LibrarySelect';
import { DuplicateList } from './components/DuplicateList';
import { Database } from 'lucide-react';

export default function App() {
  const [api, setApi] = useState<PlexAPI | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<any | null>(null);

  const handleSignOut = () => {
    setApi(null);
    setSelectedLibrary(null);
    localStorage.removeItem('plexUrl');
    localStorage.removeItem('plexToken');
  };

  if (!api) {
    return <Setup onConnected={setApi} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-300">
      {/* Navbar */}
      <header className="bg-[#111] border-b border-[#222] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#e5a00d] flex items-center justify-center text-black shadow-inner">
              <Database className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Plex<span className="text-[#e5a00d]">Clean</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-500 hidden sm:inline-block">
              Connected to Plex
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedLibrary ? (
          <LibrarySelect api={api} onSelect={setSelectedLibrary} />
        ) : (
          <DuplicateList 
            api={api} 
            library={selectedLibrary} 
            onBack={() => setSelectedLibrary(null)} 
          />
        )}
      </main>
    </div>
  );
}

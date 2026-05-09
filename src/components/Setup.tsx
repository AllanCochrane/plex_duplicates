import React, { useState } from 'react';
import { PlexAPI } from '../lib/plex';
import { Server, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Setup({ onConnected }: { onConnected: (api: PlexAPI) => void }) {
  const [url, setUrl] = useState(() => localStorage.getItem('plexUrl') || '');
  const [token, setToken] = useState(() => localStorage.getItem('plexToken') || '');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsConnecting(true);

    try {
      const api = new PlexAPI(url, token);
      await api.testConnection();
      
      // Save for next time
      localStorage.setItem('plexUrl', url);
      localStorage.setItem('plexToken', token);
      
      onConnected(api);
    } catch (err: any) {
      setError(err.message || 'Failed to connect. Make sure your URL is HTTPS (like your plex.direct URL) if using the cloud preview.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#e5a00d]/10 rounded flex items-center justify-center mb-4 border border-[#e5a00d]/20">
            <Server className="w-8 h-8 text-[#e5a00d]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Connect to Plex</h1>
          <p className="text-sm text-gray-400 mt-2 text-center">
            Enter your Plex server details to scan for duplicates. Your local network IP will only work if you allow mixed-content or use a secure plex.direct URL.
          </p>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Server URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Server className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                required
                placeholder="https://192-168-1-10.abc...plex.direct:32400"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-[#333] rounded focus:outline-none focus:ring-1 focus:ring-[#e5a00d] focus:border-[#e5a00d] sm:text-sm bg-[#181818] text-white placeholder-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Plex Token
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="password"
                required
                placeholder="Your X-Plex-Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-[#333] rounded focus:outline-none focus:ring-1 focus:ring-[#e5a00d] focus:border-[#e5a00d] sm:text-sm bg-[#181818] text-white placeholder-gray-600"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-gray-500">
              You can find your token by viewing the XML of any media item.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 text-red-400 border border-red-900/50 rounded flex gap-2 items-start text-[11px] mt-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isConnecting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded text-sm font-medium text-black bg-[#e5a00d] hover:bg-[#cc8e0c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e5a00d] focus:ring-offset-[#111] disabled:opacity-50 mt-6 transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import { PlexAPI } from '../lib/plex';
import { formatBytes } from '../lib/utils';
import { ArrowLeft, Trash2, FileVideo, HardDrive, MonitorPlay, AlertTriangle, Info, AlertCircle, Filter, X, CheckCircle2 } from 'lucide-react';

export function DuplicateList({ api, library, onBack }: { api: PlexAPI, library: any, onBack: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter states
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    
    api.getDuplicates(library.key, library.type)
      .then((data) => {
        if (!mounted) return;
        // Filter out items that don't actually have more than 1 Media
        // Sometimes Plex API returns weird edge cases.
        const validDuplicates = data.filter((item: any) => item.Media && item.Media.length > 1);
        setItems(validDuplicates);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Failed to fetch duplicates');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
      
    return () => { mounted = false; };
  }, [api, library]);

  const handleDelete = async (partId: string, mediaId: string, itemKey: string) => {
    // Only UI deletion confirmation inside the actual delete handler 
    if (!window.confirm("Are you sure you want to delete this specific file from your Plex server and disk? This action cannot be undone.")) {
      return;
    }
    
    setDeletingId(partId);
    
    try {
      const success = await api.deleteMediaPart(partId);
      if (success) {
        // Update local state to remove the part
        setItems(prevItems => {
          return prevItems.map(item => {
            if (item.ratingKey !== itemKey) return item;
            
            // Filter out the deleted media/part
            const newMedia = item.Media.map((m: any) => {
              if (m.id == mediaId) {
                return {
                  ...m,
                  Part: m.Part.filter((p: any) => p.id != partId)
                };
              }
              return m;
            }).filter((m: any) => m.Part && m.Part.length > 0);
            
            return { ...item, Media: newMedia };
          }).filter(item => item.Media && item.Media.length > 1); // Remove from list if it's no longer a duplicate
        });
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}. Make sure "Allow media deletion" is enabled in Plex Settings -> Library.`);
    } finally {
      setDeletingId(null);
    }
  };

  // Derive available filters
  const resolutions = useMemo(() => {
    const res = new Set<string>();
    items.forEach(item => {
      item.Media?.forEach((m: any) => {
        if (m.videoResolution) res.add(m.videoResolution);
      });
    });
    return Array.from(res).sort();
  }, [items]);

  const seasons = useMemo(() => {
    if (library.type !== 'show') return [];
    const seas = new Set<string>();
    items.forEach(item => {
      if (item.parentIndex) seas.add(item.parentIndex.toString());
    });
    return Array.from(seas).sort((a, b) => parseInt(a) - parseInt(b));
  }, [items, library.type]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // For show season filter
      if (library.type === 'show' && seasonFilter !== 'all') {
        if (item.parentIndex?.toString() !== seasonFilter) return false;
      }
      
      // For quality filter, we only show the item if AT LEAST one of its media matches the quality filter.
      // We will ALSO filter the files themselves in the render, but here we filter the whole item grouping.
      if (qualityFilter !== 'all') {
        const hasMatchingQuality = item.Media?.some((m: any) => m.videoResolution === qualityFilter);
        if (!hasMatchingQuality) return false;
      }
      
      return true;
    });
  }, [items, qualityFilter, seasonFilter, library.type]);

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 p-4 sm:p-6 mb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <button onClick={onBack} className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-4 group">
            <ArrowLeft className="w-3 h-3 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Libraries
          </button>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
            {library.title} <span className="text-gray-500 ml-2 font-medium">Duplicates</span>
          </h2>
        </div>
        
        {/* Filters */}
        <div className="flex bg-[#111] border border-[#222] rounded p-1.5 shadow-sm gap-2">
          <div className="flex items-center px-3 border-r border-[#333] last:border-0">
            <MonitorPlay className="w-4 h-4 text-gray-500 mr-2" />
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-gray-300 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Qualities</option>
              {resolutions.map(r => (
                <option key={r} value={r} className="bg-[#111]">{r}p / {r === '4k' ? '4K' : ''}</option>
              ))}
            </select>
          </div>
          
          {library.type === 'show' && (
            <div className="flex items-center px-3">
              <Filter className="w-4 h-4 text-gray-500 mr-2" />
              <select
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-gray-300 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Seasons</option>
                {seasons.map(s => (
                  <option key={s} value={s} className="bg-[#111]">Season {s}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded mb-6 flex text-amber-500">
        <AlertTriangle className="w-4 h-4 shrink-0 mr-3 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <p className="font-bold uppercase tracking-widest mb-1 text-xs">Delete carefully!</p>
          <p>
            Deleting a file here will permanently remove it from your disk. Ensure you only delete the duplicate you do <b>not</b> want to keep. 
            Remember to enable "Allow media deletion" in Plex server settings.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-[#111] border border-[#222] rounded-lg h-48"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-900/20 text-red-400 rounded border border-red-900/50 flex items-center text-sm">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#111] border border-[#222] rounded-lg">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white">Library is clean!</h3>
          <p className="text-sm text-gray-500 mt-1">No duplicates found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map(item => (
            <DuplicateCard 
              key={item.ratingKey} 
              item={item} 
              libraryType={library.type}
              qualityFilter={qualityFilter}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DuplicateCard({ item, libraryType, qualityFilter, onDelete, deletingId }: any) {
  // Title mapping
  const title = libraryType === 'show' 
    ? `${item.grandparentTitle} - S${String(item.parentIndex || 0).padStart(2, '0')}E${String(item.index || 0).padStart(2, '0')} - ${item.title}`
    : `${item.title} (${item.year || 'Unknown'})`;

  // Sort media by bitrate (descending) as a rough quality proxy, or size.
  const sortedMedia = [...(item.Media || [])].sort((a: any, b: any) => {
    const sizeA = a.Part?.[0]?.size || 0;
    const sizeB = b.Part?.[0]?.size || 0;
    return sizeB - sizeA; // Largest first
  });

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-18 bg-[#222] rounded border border-[#333] shrink-0 flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            {libraryType === 'show' ? 'SHOW' : 'FILM'}
          </div>
          <div>
            <h4 className="text-white font-medium">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">
              {item.Media?.length} Versions Detected • {libraryType === 'show' ? 'TV Shows' : 'Movie'} Library
            </p>
          </div>
        </div>
        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded uppercase tracking-widest leading-none">
          {item.Media?.length} Files
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {sortedMedia.map((media: any) => {
          return (
            <div key={media.id} className="bg-[#181818] p-3 rounded border border-[#222] relative flex flex-col justify-between hover:border-[#444] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                     <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Version</p>
                     <div className="flex items-center text-[10px] font-bold text-white bg-[#e5a00d]/20 px-1.5 py-0.5 rounded">
                        <MonitorPlay className="w-3 h-3 mr-1" />
                        {media.videoResolution ? `${media.videoResolution}p` : 'UNK'}
                      </div>
                  </div>
                  {media.Part?.map((part: any, i: number) => (
                    <p key={`file-${i}`} className="text-[11px] text-gray-400 mt-1 truncate font-mono" title={part.file}>
                      {part.file?.split('/').slice(-1)[0] || part.file?.split('\\').slice(-1)[0]}
                    </p>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t border-[#222] flex items-center justify-between">
                <div className="flex gap-4 text-[11px]">
                  <span className="text-white font-bold flex items-center">
                    <HardDrive className="w-3 h-3 mr-1 text-gray-500" />
                    {media.Part?.[0]?.size ? formatBytes(media.Part[0].size) : 'Unknown'}
                  </span>
                  <span className="text-gray-500 uppercase flex items-center">
                    <FileVideo className="w-3 h-3 mr-1" />
                    {media.videoCodec || 'Unknown'} • {media.bitrate ? `${media.bitrate} kbps` : '---'}
                  </span>
                </div>
                
                {media.Part?.map((part: any) => (
                  <button
                    key={part.id}
                    onClick={() => onDelete(part.id, media.id, item.ratingKey)}
                    disabled={deletingId === part.id}
                    className="inline-flex items-center px-2 py-1.5 text-[10px] font-bold rounded uppercase tracking-widest bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                  >
                    {deletingId === part.id ? 'Deleting...' : 'Delete'}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Ensure CheckCircle2 is imported, somehow it missed it - wait, added to import list at the top.

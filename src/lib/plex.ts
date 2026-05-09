export class PlexAPI {
  baseUrl: string;
  token: string;

  constructor(baseUrl: string, token: string) {
    // Ensure base URL doesn't end with slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('X-Plex-Token', this.token);
    
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    const res = await fetch(url.toString(), { ...options, headers });
    if (!res.ok) {
      throw new Error(`Plex API Error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }

  private async fetchRaw(endpoint: string, options: RequestInit = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('X-Plex-Token', this.token);
    
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    const res = await fetch(url.toString(), { ...options, headers });
    if (!res.ok) {
      throw new Error(`Plex API Error: ${res.status} ${res.statusText}`);
    }
    return res;
  }

  async testConnection() {
    return this.fetch('/');
  }

  async getLibraries() {
    const data = await this.fetch('/library/sections');
    return data.MediaContainer.Directory || [];
  }

  async getDuplicates(sectionId: string, type: 'movie' | 'show') {
    // For movies, type=1. For episodes within shows, type=4.
    const searchType = type === 'movie' ? 1 : 4;
    const data = await this.fetch(`/library/sections/${sectionId}/all?type=${searchType}&duplicate=1`);
    return data.MediaContainer.Metadata || [];
  }

  async deleteMediaPart(partId: string) {
    const res = await this.fetchRaw(`/library/parts/${partId}`, {
      method: 'DELETE'
    });
    return res.ok;
  }
}

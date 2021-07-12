import { PlaylistState } from "../../playlists/Playlists";
import { fetchApi } from "../apiUtils";

export const API_BASE_URL = 'http://localhost:8080'

export function getUserInfo() {
  return fetchApi<any>(`${API_BASE_URL}/spotify/user`, {credentials: 'include'});
}

export function exportPlaylists(selectedPlaylists: PlaylistState[], selectAll: boolean) {
  const queryParams = new URLSearchParams();

  if (selectAll) {
    queryParams.append('selectAll', 'true');
  } else {
    let ids = '';
    if (selectedPlaylists) {
      selectedPlaylists.forEach((el, index) => index === 0 ? ids += el.id : ids += `,${el.id}`)
    } 
    queryParams.append('ids', ids);
  }

  fetch(`${API_BASE_URL}/spotify/user/playlists/export?${queryParams.toString()}`, {credentials: 'include'})
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }

      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1];
      
      return response.blob().then(blob => {
        const url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = filename || 'playlists.json';
        a.click();
        window.URL.revokeObjectURL(url);
      });
    })
}

export function getPlaylists() {
  return fetchApi<PlaylistsApiRes>(`${API_BASE_URL}/spotify/user/playlists`, {credentials: 'include'})
    .then(data => 
      data.items.map(el => ({ id: el.id, name: el.name, checked: false } as PlaylistState))
    );
}

export interface PlaylistsApiRes {
  limit: number;
  items: PlaylistItem[];
  offset: number;
  total: number;
  next?: string;
  previous?: string;
}

export interface PlaylistItem {
  id: string,
  name: string;
  description: string,
  images: any[];
  owner: {
    display_name: string,
    id: string,
  },
  public: boolean;
  tracksCount: number;
}
import styled from 'styled-components'

export enum TablePageChangeAction {
  Forward,
  Backward
}

export interface PlaylistTablePaginationState {
  offset: number,
  limit: number,
  total: number,
  canGoForwards: boolean,
  canGoBackwards: boolean
}

export interface PlaylistState {
  id: string;
  name: string;
  checked: boolean;
  tracksCount: number;
}

interface PlaylistsProps {
  tablePagination: PlaylistTablePaginationState, 
  tablePaginationChangeHandler: (action: TablePageChangeAction) => void,
  playlists: (PlaylistState | null)[],
  playlistChangeHandler: (playlist: (PlaylistState | null), newVal: boolean) => void,
  selectAll: boolean, 
  selectAllChangeHandler: (selectAllChange: boolean) => void 
}

const PlaylistContainer = styled.div`
  display: grid;
  place-items: left;
  justify-content: center;
`

export function Playlists({ 
  tablePagination, 
  tablePaginationChangeHandler, 
  playlists, 
  playlistChangeHandler, 
  selectAll, 
  selectAllChangeHandler 
}: PlaylistsProps) {
  return (
    <PlaylistContainer>
      <label>
        <input 
          type="checkbox" 
          name="selectAll" 
          checked={selectAll}
          onChange={(e) => selectAllChangeHandler(e.target.checked)}
        />
        Select all
      </label>
      {playlists.length && playlists
        .slice(tablePagination.offset, tablePagination.offset + tablePagination.limit)
        .filter(el => el)
        .map(pl => 
          <Playlist
            key={pl?.id}
            playlist={pl as PlaylistState}
            changeHandler={playlistChangeHandler}
          ></Playlist>
      )}
      <button 
        onClick={() => tablePaginationChangeHandler(TablePageChangeAction.Backward)}
        disabled={!tablePagination.canGoBackwards}
      >
        {'<'}
      </button>
      <button 
        onClick={() => tablePaginationChangeHandler(TablePageChangeAction.Forward)} 
        disabled={!tablePagination.canGoForwards}
      >
        {'>'}
      </button>
      <p>Total playlists: {tablePagination.total}</p>
    </PlaylistContainer>
  );  
}

function Playlist({ playlist, changeHandler }:
  {
    playlist: PlaylistState,
    changeHandler: (playlist: PlaylistState, newVal: boolean) => void
  }) {

  return (
    <label>
      <input 
        type="checkbox" 
        name={playlist.id} 
        checked={playlist.checked}
        onChange={(e) => changeHandler(playlist, e.target.checked)}
      />
      {playlist && `${playlist.name}, tracks: ${playlist.tracksCount}`}
    </label>
  );  
}
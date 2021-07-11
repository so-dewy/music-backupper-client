import styled from 'styled-components'

const PlaylistContainer = styled.div`
  display: grid;
  place-items: center;
  justify-content: center;
`
export function Playlists({ playlists, playlistChangeHandler }:
  { 
    playlists: PlaylistState[], 
    playlistChangeHandler: (playlist: PlaylistState, newVal: boolean) => void 
  }) {
  return (
    <PlaylistContainer>
      {playlists && playlists.map(pl => 
        <Playlist
          key={pl.id}
          playlist={pl}
          changeHandler={playlistChangeHandler}
        ></Playlist>
      )}
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
      {playlist && playlist.name}
    </label>
  );  
}

export interface PlaylistState {
  id: string;
  name: string;
  checked: boolean;
}

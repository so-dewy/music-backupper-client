import styled from 'styled-components'
import { useEffect, useState } from 'react';
import { API_BASE_URL, exportPlaylists, getPlaylists, getUserInfo } from './api/spotify/spotifyApi';
import { Playlists, PlaylistState } from './playlists/Playlists';

const StyledLink = styled.a`
  background-color: magenta;
  border-radius: 7px;
  color: white;
  font-size: calc(6px + 2vmin);
  text-decoration: none;
  line-height: 2rem;
  display: inline-block;
  padding: 0 5px 0 5px;
`

function App() {
  const [userInfo, setUserInfo] = useState({ display_name: '' });
  const [playlists, setPlaylists] = useState<PlaylistState[]>([] as any);
  const [selectAll, setSelectAll] = useState<boolean>(false);


  useEffect(() => {
    getUserInfo()
      .then(res => setUserInfo(res));

    getPlaylists()
      .then(res => setPlaylists(res));
  }, []);

  const requestExport = () => {
    const selectedPlaylists = playlists.filter(el => el.checked);
  
    exportPlaylists(selectedPlaylists, selectAll);
  };

  const playlistChangeHandler = (playlist: PlaylistState, newVal: boolean) => {
    const newState = playlists.map(pl => pl.id === playlist.id ? { ...playlist, checked: newVal} : pl);
    setPlaylists(newState);
  };

  const selectAllChangeHandler = (selectAllChange: boolean) => {
    setSelectAll(selectAllChange);
    const changedPlaylistsState = playlists.map(pl => { return { ...pl, checked: selectAllChange } });
    setPlaylists(changedPlaylistsState);
  };

  return (
    <div>
      <StyledLink href={`${API_BASE_URL}/oauth2/authorization/spotify`}>Sign in to Spotify</StyledLink>
      <div>Hello, {userInfo && userInfo.display_name}, select playlists you wish to export </div>
      <label>
        <input 
          type="checkbox" 
          name="selectAll" 
          checked={selectAll}
          onChange={(e) => selectAllChangeHandler(e.target.checked)}
        />
        Select all
      </label>
      <Playlists playlists={playlists} playlistChangeHandler={playlistChangeHandler}></Playlists>
      <button onClick={() => requestExport()}>Export</button>
    </div>
  );
}

export default App;

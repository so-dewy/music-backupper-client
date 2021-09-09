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

enum TablePageChangeAction {
  Forward,
  Backward
}

interface TablePaginationState {
  offset: number,
  limit: number,
  total: number,
  canGoForwards: boolean,
  canGoBackwards: boolean
}

function App() {
  const [userInfo, setUserInfo] = useState({ display_name: '' });
  const tablePaginationInit = { offset: 0, limit: 20, total: 0, canGoBackwards: false, canGoForwards: false };
  const [tablePagination, setTablePagination] = useState<TablePaginationState>(tablePaginationInit);
  const [playlists, setPlaylists] = useState<PlaylistState[]>([] as PlaylistState[]);
  const [selectAll, setSelectAll] = useState<boolean>(false);


  useEffect(() => {
    getUserInfo()
      .then(res => setUserInfo(res));

    getPlaylists(tablePagination.offset, tablePagination.limit)
      .then(data => {
        setTablePagination({ 
          offset: data.offset,
          limit: data.limit,
          total: data.total,
          canGoForwards: (data.offset + data.limit) <= data.total,
          canGoBackwards: (data.offset - data.limit) >= 0
        });

        const playlists = data.items.map(el => ({ id: el.id, name: el.name, checked: false } as PlaylistState));
        setPlaylists(playlists);
      });
  }, []);

  const requestExport = () => {
    const selectedPlaylists = playlists.filter(el => el.checked);
  
    exportPlaylists(selectedPlaylists, selectAll);
  };

  const switchPage = (action: TablePageChangeAction) => {
    const offset = action === TablePageChangeAction.Forward ? 
      tablePagination.offset + tablePagination.limit : 
      tablePagination.offset - tablePagination.limit;

    getPlaylists(offset, tablePagination.limit)
      .then(data => {
        setTablePagination({ 
          offset,
          limit: data.limit,
          total: data.total,
          canGoForwards: (data.offset + data.limit) <= data.total,
          canGoBackwards: (data.offset - data.limit) >= 0
        });

        const playlists = data.items.map(el => ({ id: el.id, name: el.name, checked: false } as PlaylistState));
        setPlaylists(playlists);
      });
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
      <button onClick={() => switchPage(TablePageChangeAction.Backward)} disabled={!tablePagination.canGoBackwards}>{'<'}</button>
      <button onClick={() => switchPage(TablePageChangeAction.Forward)} disabled={!tablePagination.canGoForwards}>{'>'}</button>
      <p>Total playlists: {tablePagination.total}</p>
      <button onClick={() => requestExport()}>Export</button>
    </div>
  );
}

export default App;

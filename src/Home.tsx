
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { exportPlaylists, ExportType, getPlaylists, getUserInfo, PlaylistsApiRes } from './api/spotify/spotifyApi';
import { Playlists, PlaylistState, PlaylistTablePaginationState, TablePageChangeAction } from './playlists/Playlists';

export const Home = () => {
  const history = useHistory();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({ display_name: '' });
  let tablePaginationInit = { offset: 0, limit: 20, total: 0, canGoBackwards: false, canGoForwards: false };
  if (location.search) {
    const searchParams = new URLSearchParams(location.search);
    const offset = searchParams?.get('offset');
    const limit = searchParams?.get('limit');
    if (offset && offset.length && limit && limit.length) {
      const offsetNum = Number(offset);
      const limitNum = Number(limit);
      if (!isNaN(offsetNum) && !isNaN(limitNum)) {
        tablePaginationInit = { offset: offsetNum, limit: limitNum, total: 0, canGoBackwards: false, canGoForwards: false };
      }
    }
  }
  const [tablePagination, setTablePagination] = useState<PlaylistTablePaginationState>(tablePaginationInit);
  const [playlists, setPlaylists] = useState<(PlaylistState | null)[]>([] as (PlaylistState | null)[]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [exportType, setExportType] = useState<ExportType>(ExportType.XLSX);

  useEffect(() => {
    getUserInfo()
      .then(res => setUserInfo(res));

    getPlaylists(tablePagination.offset, tablePagination.limit)
      .then(data => processPlaylistsResponse(data, data.offset));

    history.push({
      pathname: location.pathname,
      search: `?offset=${tablePagination.offset}&limit=${tablePagination.limit}`
    });
  }, []);

  const switchPage = (action: TablePageChangeAction) => {
    const nextOffset = action === TablePageChangeAction.Forward ? 
      tablePagination.offset + tablePagination.limit : 
      tablePagination.offset - tablePagination.limit;

    const playlistsSlice = playlists.slice(nextOffset, nextOffset + tablePagination.limit);

    const hasEmptyElements = playlistsSlice.filter(el => el).length !== playlistsSlice.length;
    const hasEnoughElements = playlistsSlice.length === tablePagination.limit;
    const isLastPage = playlistsSlice.length === (tablePagination.total - nextOffset);

    if (!hasEmptyElements && (hasEnoughElements || isLastPage)) {
      setTablePagination({ 
        offset: nextOffset,
        limit: tablePagination.limit,
        total: tablePagination.total,
        canGoForwards: (nextOffset + tablePagination.limit) <= tablePagination.total,
        canGoBackwards: (nextOffset - tablePagination.limit) >= 0
      });
    } else {
      getPlaylists(nextOffset, tablePagination.limit)
        .then(data => processPlaylistsResponse(data, nextOffset));
    }

    history.push({
      pathname: location.pathname,
      search: `?offset=${nextOffset}&limit=${tablePagination.limit}`
    });
  };

  const processPlaylistsResponse = (data: PlaylistsApiRes, offset: number) => {
    setTablePagination({ 
      offset,
      limit: data.limit,
      total: data.total,
      canGoForwards: (data.offset + data.limit) <= data.total,
      canGoBackwards: (data.offset - data.limit) >= 0
    });

    const requestedPlaylists = data.items.map(el => ({
      id: el.id, 
      name: el.name, 
      checked: selectAll, 
      tracksCount: el.tracks.total
    } as (PlaylistState | null)));

    let nextPlaylistsState = [...playlists];

    // Need to create or pad array to the required amount of items (offset + 1) because splice will just add to the end of array
    // and not to specified index. Probably should've used for loop but oh well..
    const requiredAmountInArray = offset + 1;
    if (!nextPlaylistsState.length) {
      nextPlaylistsState = new Array(requiredAmountInArray).fill(undefined);
    }
    const itemsToAdd = requiredAmountInArray - nextPlaylistsState.length;
    for (let i = 0; i < itemsToAdd; i++) {
      nextPlaylistsState.push(null);
    }

    nextPlaylistsState.splice(offset, requestedPlaylists.length, ...requestedPlaylists);

    setPlaylists(nextPlaylistsState);
  };

  const requestExport = () => {
    const selectedPlaylists = playlists.filter(el => el?.checked);
  
    exportPlaylists(exportType, selectedPlaylists, selectAll);
  };

  const playlistChangeHandler = (playlist: (PlaylistState | null), newVal: boolean) => {
    const newState = playlists.map(pl => pl && playlist && pl.id === playlist.id ? { ...playlist, checked: newVal} : pl);
    setPlaylists(newState);
  };

  const selectAllChangeHandler = (selectAllChange: boolean) => {
    setSelectAll(selectAllChange);
    const changedPlaylistsState = playlists.map(pl => { return { ...pl, checked: selectAllChange } as (PlaylistState | null) });
    setPlaylists(changedPlaylistsState);
  };

  return (
    <>
      <div>Hello, {userInfo && userInfo.display_name}, select playlists you wish to export </div>
      <Playlists 
        tablePagination={tablePagination}
        tablePaginationChangeHandler={switchPage}
        playlists={playlists}
        playlistChangeHandler={playlistChangeHandler}
        selectAll={selectAll}
        selectAllChangeHandler={selectAllChangeHandler}
      ></Playlists>
      <label>
        Export type:
        <select value={exportType} onChange={e => setExportType(e.target.value as ExportType)}>
          <option value={ExportType.XLSX} key={ExportType.XLSX}>Excel (.xlsx)</option>
          <option value={ExportType.XLS} key={ExportType.XLS}>Excel (.xls)</option>
          <option value={ExportType.CSV} key={ExportType.CSV}>CSV</option>
          <option value={ExportType.JSON} key={ExportType.JSON}>JSON</option>
        </select>
      </label>
      <button onClick={requestExport} disabled={!selectAll && !playlists.some(el => el && el.checked)}>Export</button>
    </>
  );
}
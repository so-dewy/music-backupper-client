
import { useEffect, useState } from 'react';
import { exportPlaylists, ExportType, getPlaylists, getUserInfo } from './api/spotify/spotifyApi';
import { Playlists, PlaylistState, PlaylistTablePaginationState, TablePageChangeAction } from './playlists/Playlists';

export const Home = () => {
  const [userInfo, setUserInfo] = useState({ display_name: '' });
  const tablePaginationInit = { offset: 0, limit: 20, total: 0, canGoBackwards: false, canGoForwards: false };
  const [tablePagination, setTablePagination] = useState<PlaylistTablePaginationState>(tablePaginationInit);
  const [playlists, setPlaylists] = useState<PlaylistState[]>([] as PlaylistState[]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [exportType, setExportType] = useState<ExportType>(ExportType.XLSX);

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
  
    exportPlaylists(exportType, selectedPlaylists, selectAll);
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

        const playlists = data.items.map(el => ({ id: el.id, name: el.name, checked: selectAll } as PlaylistState));
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
    <>
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
      <Playlists 
        tablePagination={tablePagination}
        tablePaginationChangeHandler={switchPage}
        playlists={playlists}
        playlistChangeHandler={playlistChangeHandler}
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
      <button onClick={() => requestExport()} disabled={!selectAll && !playlists.some(el => el.checked)}>Export</button>
      {/* <button onClick={() => requestData()}>requestData</button> */}
    </>
  );
}
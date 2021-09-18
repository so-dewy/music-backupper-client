import styled from 'styled-components'
import { API_BASE_URL, isSignedIn } from './api/spotify/spotifyApi';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { UserPage } from './UserPage';
import { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import CloudsSvg from './assets/endless-clouds.svg';
import { ReactComponent as SmileySvg } from './assets/smiley.svg';

const GlobalStyle = createGlobalStyle`
  body {
    --persian-indigo: #27187E;
    --cornflower-blue: #758BFD;
    --maximum-blue-purple: #AEB8FE;
    --cultured: #F1F2F6;
    --dark-orange: #FF8600;
    background: url(${CloudsSvg});
    background-color: var(--persian-indigo);
    color: var(--cultured);
  }
`

const OuterGridLayout = styled.div`
    display: grid;
    grid-template-rows: 0.5fr 8fr;
    grid-template-columns: 0.2fr 2fr 0.2fr;
`

const StyledButton = styled.button`
  background-color: var(--cornflower-blue);
  color: var(--cultured);
  border: none;
  border-radius: 22px;
  font-size: calc(2px + 2vmin);
  font-weight: bold;
  text-decoration: none;
  line-height: 2rem;
  height: 48px;
  width: 257px;
  display: inline-block;
  padding: 0 5px 0 5px;
`

function App() {
  const [signedIn, setSignedIn] = useState<boolean>(false);

  const signInHandler = () => {
    const currentWindow: Window & { authSuccess?: boolean } = window;
    const url = `${API_BASE_URL}/oauth2/authorization/spotify`;
    const width = 500;
    const height = 400;
    const left = currentWindow.screenX + (window.outerWidth - width) / 2;
    const top = currentWindow.screenY + (window.outerHeight - height) / 2.5;
    const title = `WINDOW TITLE`;
    currentWindow.open(url, title, `width=${width},height=${height},left=${left},top=${top}`);

    // monitor current window object for authSuccess flag being set from auth window
    const timer = setInterval(() => {
      if (currentWindow.authSuccess === undefined) return;
  
      setSignedIn(currentWindow.authSuccess);
      delete currentWindow.authSuccess;
      timer && clearInterval(timer);
    }, 100);
  };
  
  useEffect(() => {
    isSignedIn()
      .then(res => setSignedIn(res));
  }, []);

  return (
    <Router>
      <GlobalStyle />
      <OuterGridLayout>
        <nav style={{gridColumn: 2}}>
          <p style={{ color: 'var(--cornflower-blue)', fontSize: '25px', fontWeight: 'bold' }}>MusicDumps</p>
        </nav>
        <Switch>
          <Route path="/auth-success">
            <CloseWindow authSuccess={true}/>
          </Route>
          <Route path="/auth-failure">
            <CloseWindow authSuccess={false}/>
          </Route>
          <Route path="/">
            { signedIn ? <UserPage /> : <Home signInHandler={signInHandler}></Home> }
          </Route>
        </Switch>
      </OuterGridLayout>
    </Router>
  );
}

const Home = ({signInHandler}: { signInHandler: () => void }) => {
  const Wrapper = styled.div`
    grid-row: 2;
    grid-column: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 100px;
  `;

  const ButtonSlot = styled.div`
    background-color: transparent;
    border: 1px dashed var(--cultured);
    border-radius: 22px;
    width: 257px;
    height: 48px;
    box-sizing: border-box;
  `;
  return (
    <Wrapper>
      <div style={{ gridRow: 1, gridColumn: 1 }}>
        <h1 style={{ fontSize: 'calc(16px + 5vmin)', fontWeight: 'bold', margin: 0 }}>
          Always good to have backups 
        </h1>
        <SmileySvg style={{ height: 180, transform: 'translate(200%, -20%)'}}/>
      </div> 
      <div style={{ gridRow: 1, gridColumn: 2, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 72 }}>
          <StyledButton onClick={signInHandler}>Sign in to Spotify</StyledButton>
          <ButtonSlot></ButtonSlot>
          <ButtonSlot></ButtonSlot>
        </div>
        <p >More platforms soon?</p>
      </div>
      <p style={{ gridRow: 2, gridColumn: 1 }}>Backup formats availible</p>
    </Wrapper>
  );
}

const CloseWindow = ({ authSuccess }: { authSuccess: boolean } )=> {
  const opener: Window  & { authSuccess?: boolean } | null  = window.opener;
  if (opener) {
    opener.authSuccess = authSuccess;
  }
  window.close();
  return <div></div>;
}

export default App;

import styled from 'styled-components'
import { API_BASE_URL, isSignedIn } from './api/spotify/spotifyApi';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Home } from './Home';
import { useEffect, useState } from 'react';

const StyledButton = styled.button`
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
      <div>
        <Switch>
          <Route path="/auth-success">
            <CloseWindow authSuccess={true}/>
          </Route>
          <Route path="/auth-failure">
            <CloseWindow authSuccess={false}/>
          </Route>
          <Route path="/">
            { signedIn ? <Home /> : <StyledButton onClick={signInHandler}>Sign in to Spotify</StyledButton> }
          </Route>
        </Switch>
      </div>
    </Router>
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

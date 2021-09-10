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
    const url = `${API_BASE_URL}/oauth2/authorization/spotify`;
    const width = 500;
    const height = 400;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const title = `WINDOW TITLE`;
    window.open(url, title, `width=${width},height=${height},left=${left},top=${top}`);
  };
  
  useEffect(() => {
    isSignedIn()
      .then(res => setSignedIn(res));
  }, []);

  return (
    <Router>
      <div>
        <Switch>
          <Route path="/">
            <StyledButton onClick={signInHandler}>Sign in to Spotify</StyledButton>
          </Route>
          {signedIn && <Route path="/home">
            <Home />
          </Route>}
          <Route path="/yes">
            <AuthSuccess />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

const AuthSuccess = () => {
  window.close();
  return <div></div>;
}

export default App;

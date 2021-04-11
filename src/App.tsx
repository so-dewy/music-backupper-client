import styled from 'styled-components'

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
  const params = getHashParams();
  return (
    <div>
      <StyledLink href='http://localhost:8888/login'>Sign in to Spotify</StyledLink>
      <div>access_token: {params && params.access_token}</div>
      <div>refresh_token: {params && params.refresh_token}</div>
    </div>
  );
}

function getHashParams() {
  const hashParams: { [key: string]: string} = {};
  const regex = /([^&;=]+)=?([^&;]*)/g;
  const q = window.location.hash.substring(1);
  let res;
  res = regex.exec(q);
  while (res) {
     hashParams[res[1]] = decodeURIComponent(res[2]);
     res = regex.exec(q);
  }
  return hashParams;
}

export default App;

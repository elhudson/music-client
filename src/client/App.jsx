import Uri from 'jsuri'
import { useAsync } from 'react-async-hook'
import { useState } from 'react'
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'
import * as tools from '../shared/tools.mjs'

import {Play, Pause} from 'lucide-react'
import { css } from '@emotion/css';

const parse_filenames = async (prom) => {
  return prom
    .then((p) => p.json())
    .then(j => Object.values(j)
    .map(t => tools.filenameToSong(t)))
}

const playlists = await parse_filenames(fetch('/playlists'))
const songs = await parse_filenames(fetch('/songs'))

function App() {
  return (
    <>
    <button onClick={async ()=>await fetch('/start')}>Start Server</button>
    <audio controls>
      <source src='http://146.115.71.239:8000/soulweight.ogg' />
    </audio>
    <Tabs>
      <TabList>
        <Tab>Playlists</Tab>
        <Tab>Songs</Tab>
      </TabList>
      <TabPanel>
        <Playlists playlists={playlists} />
      </TabPanel>
      <TabPanel>
        <h1>Songs</h1>
        <div>
          {songs.map(s => <Song title={s} />)}
        </div>
      </TabPanel>
    </Tabs>
    </>
  );
}

function AddSong({ pls, show = false }) {
  return (
    <form
      style={{
        'display': show ? 'block' : 'none'
      }}
      action={`/playlist?title=${pls}&action=add`}
      method="post"
      encType="multipart/form-data">
      <label htmlFor='title'>Title </label>
      <input id='title' name='title' type='text' />
      <label htmlFor='file'>File</label>
      <input id="file" name="file" type="file" />
      <button>
        Upload
      </button>
    </form>
  )
}

function Playlists({playlists}) {
  return(<Tabs>
    <TabList>
      {playlists.map(t=><Tab>{t}</Tab>)}
    </TabList>
    {playlists.map(t=> 
    <TabPanel>
      <Playlist title={t} />
    </TabPanel>)}
  </Tabs>)
}

function Playlist({ title }) {
  const getPlaylist = async f => await parse_filenames(fetch(`/playlist?title=${title}`))
  const pls = useAsync(getPlaylist)

  const [upload, setUpload] = useState(false)
  const showUpload = () => setUpload(!upload)

  return (
    <>
    <h3>{title}</h3>
    <button onClick={showUpload}>Add</button>
    <AddSong pls={title} show={upload} />
    {pls.result && pls.result.map(t => <Song title={t} />)}
    </>
  )
}

function Song({ title }) {
  const endpoint=(t, action)=> {
    return async () => await fetch(new Uri()
      .setPath('song')
      .setQuery(`?title=${t}&action=${action}`))
  }
  const player = endpoint(title, 'play')
  const pauser = endpoint(title, 'pause')
  return (
      // <AudioPlayer
      //   src={`/music/tracks/${tools.songToFilename({ title: title })}`}
      //   autoPlay={false}
      //   showSkipControls={false}
      //   showJumpControls={false}
      //   layout={'horizontal'}
      //   customProgressBarSection={[
      //     RHAP_UI.MAIN_CONTROLS,
      //     RHAP_UI.LOOP,
      //     RHAP_UI.CURRENT_TIME,
      //     RHAP_UI.PROGRESS_BAR,
      //     RHAP_UI.CURRENT_LEFT_TIME
      //   ]}
      //   customVolumeControls={[]}
      //   customAdditionalControls={[]}
      //   customControlsSection={[]}
      //   header={title}
      //   onPlay={player}
      //   onPause={pauser}
      //   autoPlayAfterSrcChange={false}
      // />
      <div>
        {title}
        <button onClick={player}>Play</button>
        <button onClick={pauser}>Pause</button>
      </div>
  )
}





export default App;

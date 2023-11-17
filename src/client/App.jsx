import Uri from 'jsuri'
import { useAsync } from 'react-async-hook'
import { useState } from 'react'
import AudioPlayer, {RHAP_UI} from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'
import * as tools from '../shared/tools.mjs'

import {Play, Pause, Music, Plus} from 'lucide-react'
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
    <Tabs>
      <TabList>
        <Tab>Playlists</Tab>
        <Tab>Songs</Tab>
      </TabList>
      <TabPanel>
        <Playlists playlists={playlists} />
      </TabPanel>
      <TabPanel>
        <AllSongs songs={songs} />
      </TabPanel>
    </Tabs>
  )
}

function AllSongs({songs}) {
  const [playing, setPlaying]=useState(null)
  return(
    <>
      <h1>Songs</h1>
      <div>
        <AddSong />
        {songs.map(s => <Song 
            title={s} 
            playing={playing==s}
            setPlaying={setPlaying}
          />)}
      </div>
    </>
  )
}

function UploadSong({ pls=null, show = false }) {
  const url = pls != null ? `/playlist?title=${pls}&action=add` : '/songs'
  return (
    <form
      style={{
        'display': show ? 
        'block' : 'none'
      }}
      action={url}
      method="post"
      encType="multipart/form-data">
      <label htmlFor='title'>Title </label>
      <input id='title' name='title' type='text' />
      <label htmlFor='file'>File</label>
      <input id="file" name="file" type="file" />

      <button>Upload</button>

    </form>
  )
}

function AddSong({pls=null}) {
  const [upload, setUpload] = useState(false)
  const showUpload = () => setUpload(!upload)
  return(
    <div>
      <button onClick={showUpload}>
        <Plus/>
      </button>
      <UploadSong pls={pls} show={upload} />
    </div>
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
  const [playing, setPlaying]=useState(null)
  const getPlaylist = async f => await parse_filenames(fetch(`/playlist?title=${title}`))
  const pls = useAsync(getPlaylist)

  return (
    <>
    <h3>{title}</h3>
    {pls.result && 
      pls.result.map(t => <Song 
        title={t} 
        playing={t==playing} 
        setPlaying={setPlaying} />)}
    </>
  )
}

function Song({ title, setPlaying, playing=false }) {
  const setActive=async (t)=>await fetch(`/song?title=${t}`)
  return (
      <div>
        {playing && <Music/>}
        {title}
        <button onClick={async ()=> {
          setPlaying(title)
          await setActive(title).then(async ()=> await fetch('/play'))
        }}>Play</button>
        <button onClick={async ()=> await fetch('/pause')}>Pause</button>
      </div>
  )
}

export default App;

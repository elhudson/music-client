import express from "express";
import ViteExpress from 'vite-express'
import fs from 'node:fs'
import path from 'node:path'
import multer from "multer";
import url from "node:url";

import * as tools from '../shared/tools.mjs'
import * as paths from '../shared/paths.mjs'
import * as icecast from './shout.js'

const app = express();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
app.use(express.static('public'))

const channel=icecast.create()
channel.open()

app.locals.song=null
app.locals.silence=icecast.src.silence()

const params=(res)=>url.parse(res.req.url, true).query

app.get("/song", async (req, res) => {
  // this sets the currently active song on the IceCast server
  const query=params(res)
  req.app.locals.song=icecast.src.fromFile(query.title)
  res.send('Active song set.')
})

app.get('/play', (req, res)=> {
  req.app.locals.song.broadcast(channel)
  res.send('Song played.')
})

app.get('/pause', (req, res)=> {
  req.app.locals.silence.broadcast(channel)
  res.send('Song paused.')
})

app.post('/songs', upload.single('file'), (req, res) => {

  // this allows the user to add a file to their library

  const song=req.file.buffer 
  const song_file=tools.songToFilename({
    title:req.body.title,
  })
  fs.writeFileSync(
    path.join(
      paths.tracks, 
      song_file
    ), 
    song) 
  res.redirect('/')
})

app.get('/playlist', (req, res) => {
  // this gets all the song titles in a playlist
  const query=params(res)
  res.send(fs.readFileSync(
    path.join(
      paths.playlists,
      tools.songToFilename({
        title:query.title, 
        playlist:true
      })
    ),
    {encoding:'utf-8'}
  ).split('\n'))
})

app.post('/playlist', (req, res) => {
  // this adds a song to the playlist
  const args=params(res)

  const pls_file=tools.songToFilename({
    title:args.title,
    playlist:true
  })

  const song_file=tools.songToFilename({
    title:args.song
  })

  const pls_path=path.join(
    paths.playlists,
    pls_file
  )

  fs.appendFileSync(pls_path, `\n`)
  fs.appendFileSync(pls_path, song_file)

  res.redirect('/')
})

app.get('/playlists', (req, res) => {
  // this gets all the playlists in the library
  res.send(fs.readdirSync(paths.playlists))
})

app.get('/songs', (req, res) => {
  // this gets all the songs in the library
  res.send(fs.readdirSync(paths.tracks))
})

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

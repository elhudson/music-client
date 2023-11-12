import express from "express";
import ViteExpress from 'vite-express'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import multer from "multer";
import {exec, spawn} from 'node:child_process'
import url from "node:url";

import * as tools from '../shared/tools.mjs'
import * as paths from '../shared/paths.mjs'

const app = express();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const scripts=path.join(paths.root, 'src/server/icecast/')

app.use(express.static('public'))

const server_command=(liq)=> {
  const telnet=spawn('telnet', ['localhost', '1234'])
  const ls=spawn('echo', [liq])
  
  ls.stdout.on('data', (data)=> {
    telnet.stdin.write(data)
  })

  telnet.stdout.on('data', (data)=> {
    console.log(data.toString('utf-8'))
  })

  telnet.stderr.on('data', (data)=> {
    console.log(data.toString('utf-8'))
  })
}

function cmd(bash) {
  exec(bash, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
})
}

app.get('/start', (req, res)=> {
  cmd(`liquidsoap ${path.join(scripts, 'start.liq')} -- -d ${paths.tracks}`)
  res.redirect('/')
})


const params=(res)=>url.parse(res.req.url, true).query

app.get("/song", async (req, res) => {
  const song=params(res)
  // const data=song.action=='play' ? `http://localhost:3000/music/tracks/${tools.songToFilename({title:song.title})}` : ''
  const file=path.join(paths.tracks, tools.songToFilename({title:song.title}))
  song.action=='play' &&
    fs.writeFileSync(
      path.join(paths.root, '/public/music/current.m4a'), 
      fs.readFileSync(file, {encoding:'utf-8'})
    ) 
})




app.post('/song', upload.single('file'), (req, res) => {
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
  }
)

app.get('/playlist', (req, res) => {
  // this gets all the song titles in a playlist
  const query=params(res)
  console.log(query.title)
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
  const query=params(res)
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

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

export const root=process.cwd()
export const music_folder=path.join(root, 'public/music/')

export const playlists=path.join(music_folder, 'playlists/')
export const tracks=path.join(music_folder, 'tracks/')

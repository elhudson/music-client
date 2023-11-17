export function songToFilename({title, playlist=false}) {
  const suffix=playlist ? '.pls' : '.mp3'
  const filename=title.replaceAll(' ', '_').toLowerCase()+suffix
  return filename
}

export function filenameToSong(filename) {
  return filename.replaceAll('_', ' ').split(' ').map(f=>f[0].toUpperCase()+f.slice(1)).join(" ").split('.')[0]
}



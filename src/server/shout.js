import fs from 'fs/promises'

import nodeshout from 'nodeshout'

import * as tools from '../shared/tools.mjs'
import * as paths from '../shared/paths.mjs'


nodeshout.init()

const shout=nodeshout.create()
shout.setHost('146.115.71.239')
shout.setPort('8000')
shout.setUser('source')
shout.setPassword('hackme')
shout.setMount('soulweight.ogg')
shout.setFormat(0)

// Open file & prepare reading
const fileHandle = await fs.open('./ye_olde_college_try.m4a')
const stats=await fileHandle.stat()
const fileSize=stats.size
const chunkSize = 65536;
const buf = Buffer.alloc(chunkSize);
let totalBytesRead = 0;

// Reading & sending loop
while (totalBytesRead < fileSize) {
    // For the latest chunk, its size may be smaller than the desired
    const readLength = (totalBytesRead + chunkSize) <= fileSize ?
        chunkSize :
        fileSize - totalBytesRead;

    // Read file
    const {bytesRead} = await fileHandle.read(buf, 0, readLength, totalBytesRead);

    totalBytesRead = totalBytesRead + bytesRead;
    console.log(`Bytes read: ${totalBytesRead} / ${fileSize}`);

    // If 0 bytes read, it means that we're finished reading
    if (bytesRead === 0) {
        break;
    }

    // Send the data
    shout.send(buf, bytesRead);

    // Wait for the next chunk
    // THIS WILL BLOCK THE I/O
    shout.sync();
   
}

console.log('Finished reading, closing shout...');

// Close the file handle
await fileHandle.close();

// Close nodeshout
shout.close();
import fs from 'node:fs'
import fsp from 'fs/promises'
import path from 'node:path'
import nodeshout from 'nodeshout'

import _ from 'lodash'

import * as tools from '../shared/tools.mjs'
import * as paths from '../shared/paths.mjs'

export function create() {
    nodeshout.init()

    const shout=nodeshout.create()

    shout.setHost('146.115.71.239')
    shout.setPort('8000')
    shout.setUser('source')
    shout.setPassword('hackme')
    shout.setMount('soulweight')
    shout.setFormat(1)
    return shout
}

export class src {
    constructor(handle) {
        this.ref=handle
        this.data=fs.readFileSync(handle)
        this.size=this.data.byteLength
        this.chunkSize=65536
        this.buffer=Buffer.alloc(this.chunkSize)
        this.read=0
        this.playing=false
    }

    static fromFile(title) {
        return new src(path.join(paths.tracks, tools.songToFilename({title:title})))
    }

    static silence() {
        return new src(path.join(paths.tracks, 'paused.mp3'))
    }

    getProgress() {
        const increments=Math.ceil(this.size/this.chunkSize)
        for (i of _.range(increments)) {
            if (i>this.read) {
                return (i/increments)
            }
        }
    }

    async broadcast(channel) {
        while (this.size > this.read) {
            await this.readChunk(channel)
            channel.sync()
        }
    }

    allocChunk() {
        if (this.read+this.chunkSize > this.size) {
            return this.size-this.read
        }
        else {
            return this.chunkSize
        }
    }

    async readChunk(channel) {
        const chunk=this.allocChunk()
        const start=this.read
        const end=this.chunk
        this.data.copy(this.buffer, 0, start, end)
        channel.send(this.buffer, this.buffer.byteLength)
        this.read+=chunk
    }
}

# dir=getopt(default='X', '-d')

# playing=interactive.string('current', '')
# queue=request.equeue(id='q')

# server.telnet()
# interactive.harbor()

# set('settings.server.timeout', -1)

# src=fallback

stream=output.icecast(
    %vorbis, 
    host='146.115.71.239', 
    port=8000, 
    password='hackme', 
    mount='soulweight.ogg', 
    fallback([single('http://localhost:3000/music/current'), blank()])
)


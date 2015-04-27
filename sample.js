var stream = require('stream')
var yauzl = require('yauzl')

yauzl.open('zipbomb.zip', function (err, zipFile) {
  if (err) {
    console.log('ERR', err)
    return
  }
  zipFile.on('entry', handleEntry)
  zipFile.on('error', function (e) { console.log('zipFile error:', e) })

  function handleEntry(entry) {
    zipFile.openReadStream(entry, function (err, readStream) {
      if (err) {
        console.log('ERR', err)
        return
      }
      readStream.on('error', function (e) { console.log('readStream error:', e) })
      var ws = new stream.Writable()
      ws.__myBuffer = new Buffer(0, "binary")
      ws._write = function (chunk, enc, done) {
        if (this.__myBuffer.length + chunk.length > 1 * 1024 * 1024) {
          console.log(this.__myBuffer.length + chunk.length, 'over the limit')
          done(new Error("zip bomb, zip bomb, you're my zip bomb"))
          return
        }
        this.__myBuffer = Buffer.concat([this.__myBuffer, chunk])
        done()
      }
      ws.on('error', function (e) { console.log('ws error', e); readStream.close() })
      readStream.pipe(ws)
    })
  }
})


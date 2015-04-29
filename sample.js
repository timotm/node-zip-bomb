var stream = require('stream')
var yauzl = require('yauzl')

yauzl.open('test_mismatch_size.zip', function (err, zipFile) {
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
        if (this.__myBuffer.length + chunk.length > entry.uncompressedSize) {
          console.log('actual uncompressed size', this.__myBuffer.length + chunk.length, 'is bigger than advertised size', entry.uncompressedSize)
        }
        this.__myBuffer = Buffer.concat([this.__myBuffer, chunk])
        done()
      }
      ws.on('error', function (e) { console.log('ws error', e); })
      readStream.pipe(ws)
    })
  }
})


# zip bomb reproduction sample

1. create a zip bomb: `dd if=/dev/zero bs=1024 count=4194305 | zip zipbomb.zip -`
1. try to parse zip with zip bomb detection by starting sample.js: `node sample.js`
1. expected behavior: no crashes
1. actual behavior: crashes inside zlib

        Assertion failed: (ctx->mode_ != NONE && "already finalized"), function Write, file ../src/node_zlib.cc, line 147.
        Abort trap: 6

zlib.js patch to make this work:

    --- zlib.js.orig	2015-04-27 13:28:35.000000000 +0300
    +++ zlib.js	2015-04-27 13:58:50.000000000 +0300
    @@ -592,6 +592,9 @@
           if (!async)
             return true;
     
    +      if (self._closed)
    +        return cb(new Error('zlib binding closed'));
    +
           var newReq = self._handle.write(flushFlag,
                                           chunk,
                                           inOff,


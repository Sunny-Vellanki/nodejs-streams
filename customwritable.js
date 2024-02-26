const { Writable } = require("node:stream");

const fs = require("node:fs");

class FileWriteStream extends Writable { 
    constructor({ highWaterMark, fileName }) { 
        super({ highWaterMark });

this.fileName = fileName;

this.fd = null;

this.chunks = [];

this.chunksSize = 0;

this.writesCount = 0;

}

// This will run after the constructor, and it will

// methods until we call the callback function

_construct(callback) {

fs.open(this.fileName, "w", (err, fd) => {

if (err) {

// so if we call the callback with an argument

// and we should not proceed

callback(err);

} else {

this.fd=fd;
 callback();
}

});

}

_write(chunk, encoding, callback) {

this.chunks.push(chunk);

this.chunksSize += chunk. length;

if (this.chunksSize > this.writableHighWaterMark) {

fs.write(this.fd, Buffer.concat(this.chunks), (err) => {

if (err) {

return callback(err);
}
 this.chunks = [];

this.chunksSize = 0;

++this.writesCount;



callback();

});

} else {

// when we're done, we should call the callback fu

callback();
}

}

_final (callback) {

fs.write(this.fd, Buffer.concat(this.chunks),(err)=>{

if (err) return callback(err);

this.chunks = [];

callback();

});

}

_destroy(error, callback) {

console.log("Number of writer:", this.writesCount);

if (this.fd) {

fs.close(this.fd, (err) => {

callback(err || error);

});

} else {

callback(error);

}

}

}

(async () => {

console.time("writeMany");

const stream = new FileWriteStream({

fileName: "text.txt",

});

let i = 0;
 const numberOfWrites = 100000;

const writeMany = () => { 
    while (i < numberOfWrites) {

const buff = Buffer.from(`${i}`,"utf-8");

// this is our last write

if (i === numberOfWrites -1) { return stream.end(buff); I

}

// if stream.write returns false, stop the loop 
if (!stream.write(buff)) break;

i++;

}

};

writeMany();
let d=0;
stream.on("drain", () => {
++d;
// console.log("Drained!!!");

writeMany();

});

stream.on("finish", () => {
    console.log("numbetr of drains:", d)

console.timeEnd("writeMany");

});

})();
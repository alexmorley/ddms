#!/usr/bin/nodejs
"use strict";

var program = require('commander');
const fs = require('fs');
const path = require('path');
const Rsync = require('./rsync');

program
    .version('0.0.1')
    .option('-b, --basename [bsnm]', 'Recording Day Identifier', '')
    .option('-t, --tmpdir [tmpdir]',   'Temporary Directory for Datasets', '')
    .option('-t, --_tempdir [tmpdir]')
    .option('-r, --rawpath [/vtadX/XXX_raw/xx10-160604/]','')
    .option('-h, --rawhost [data@vta]','')
    .parse(process.argv);

console.log(program.tmpdir);
// Make the Dataset Path if it doesn't exist
var datasetPath = path.join(program.tmpdir, 'datasets', program.basename);
if (!(fs.existsSync(datasetPath))) {
    fs.mkdirSync(datasetPath);
};

// Copy the par file there
var tmpParPath =  path.join(datasetPath, program.basename + '.par');
if (!(fs.existsSync(tmpParPath))) {
    fs.copyFileSync(program.basename+'.par', tmpParPath);
};

// Convert the par file to params.json
var Par = require('./par.js');
var paramsPath = path.join(datasetPath, 'params.json');
var t = Par.read_write(tmpParPath, paramsPath, function (err)
    { if(err) {
                  console.log("Error reading par file");
              }
    }
);

// Try to resolve the folder on the host computer using rsync
// Then copy all of the dat files
// We use rsync's archiv mode to prevent copying if the files
// are already there
var rsync = new Rsync()
  .shell('ssh')
  .flags('a')
  .set('progress')
  .source(program.rawhost+':'+program.rawpath)
  .destination(datasetPath+'/');

// Execute the command
rsync.execute(function(err, code, cmd) {
    console.log(cmd);
    if (!(err)) {console.log("Success ", cmd);
    } else if (err) {
        console.log("Error: ", err);
    }
});

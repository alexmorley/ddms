#!/usr/bin/nodejs
"use strict";

var program = require('commander');
const fs = require('fs');
const path = require('path');
const Rsync = require('./rsync');

program
    .version('0.0.1')
    .option('-b, --basename [bsnm]', 'Recording Day Identifier', '')
    .option('-P, --procdir [proc_dir]',   'Proc Directory', '')
    .option('-t, --tmpdir [tmpdir]',   'Temporary Directory for Datasets', '')
    .option('-t, --_tempdir [tmpdir]')
    .option('-p, --params','params.json output')
    .option('-r, --rawpaths [/vtadX/XXX_raw/xx10-160604/]','')
    .option('-h, --rawhost [data@vta]','')
    .parse(process.argv)

var searchstr = '--rawpaths=/mnfs';
program.rawpaths = process.argv.filter(function (x) {
    console.log(x);
    var yes = x.startsWith(searchstr);
    return yes})
.map(function(el) {
    return el.slice(searchstr.length,el.length);
});

// Make the Dataset Path if it doesn't exist
var datasetPath = path.join(program.tmpdir, 'datasets', program.basename);
if (!(fs.existsSync(datasetPath))) {
    fs.mkdirSync(datasetPath);
};

// Copy the par file there
var tmpParPath =  path.join(datasetPath, program.basename + '.par');
if (!(fs.existsSync(tmpParPath))) {
    fs.copyFileSync(proc_dir + '/' + program.basename+'.par', tmpParPath);
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
program.rawpaths.forEach( function(rawpath) {
    var rsync = new Rsync()
      .shell('ssh')
      .flags('a')
      .set('progress')
      .source(program.rawhost+':'+rawpath)
      .destination(datasetPath+'/');

    // Execute the command
    rsync.execute(function(err, code, cmd) {
        console.log(cmd);
        if (!(err)) {console.log("Success ", cmd);
        } else if (err) {
            console.log("Error: ", err);
        }
    });
})

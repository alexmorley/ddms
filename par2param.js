#!/usr/bin/nodejs

const fs = require('fs');
var inputFile = process.argv[process.argv.length - 2];
var outputFile = process.argv[process.argv.length - 1];

var Par = require('./par.js')
var t = Par.read_write(inputFile, outputFile, function (err)
    { if(err) {
                  console.log("Error reading par file");
              }
    }
    );

#!/usr/bin/nodejs

const fs = require('fs');
var inputFile = process.argv[process.argv.length - 1];

var Par = require('./par.js')
var t = Par.readPar(inputFile, function (err,data)
    { if(err) {
                  console.log("Error reading par file");
              } else {
                  console.log(data);
              }
    }
    );

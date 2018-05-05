#!/usr/bin/nodejs
"use strict";

const fs = require('fs');

var filedir = process.cwd().split("/");
var bsnm    = filedir[filedir.length-1];
var inputFile = bsnm + '.par' //process.argv[process.argv.length - 1];

var Par = require('./par.js')
var t = Par.readPar(inputFile, function (err,data)
    { if(err) {
                  console.log("Error reading par file");
              } else {
                  var arr = data["tetrodes"];
                  for (var i=0; i < arr.length; i++) {
                      var offset = 100*i;
                      console.log(offset+","+offset);
                      console.log((offset-25)+","+(offset+25));
                      console.log((offset+25)+","+(offset+25));
                      console.log(offset+","+(offset+50));
                  }
              }
    }
    );

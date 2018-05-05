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
                  var arr = [].concat(...data["tetrodes"]);
                  var channels = arr.map(function(x) {return x}).join(",");
                  fs.writeFile("data/channels.csv", channels, function(err) {
                      if(err) {console.log(err);}
                      console.log("Success");
                  });
              }
    }
);

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
                  var geomcsv = ''
                  for (var i=0; i < arr.length; i++) {
                      var offset = 100*i;
                      geomcsv = geomcsv + offset +    "," + offset   +'\n';
                      geomcsv = geomcsv + (offset-25)+","+(offset+25)+'\n';
                      geomcsv = geomcsv + (offset+25)+","+(offset+25)+'\n';
                      geomcsv = geomcsv + offset+     ","+(offset+50)+'\n';
                  }

                  fs.writeFile("data/geom.csv", geomcsv, function(err) {
                      if(err) {return console.log(err);}
                      console.log("Success.");
              });
              }}
    );

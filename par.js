const fs = require('fs');
module.exports = {
    _read: function readPar(inputFile, callback) {
        fs.readFile(inputFile, 'ascii', function(err, data) {
            if(err) {
                callback(err);
            }
            lines = data.split('\n');
            
            var [num_channels,dtype]    = lines[0].split(" ");
            var [resolution, eeg] = lines[1].split(" ");
            var [ntet,  refchan]  = lines[2].split(" ");
            var samplerate        = parseInt((1/resolution)*1000000);
            dtype = 'int' + dtype;

            ntet = Number(ntet)
            var tetrodes = [];
            var chans
            for (let i = 0; i < ntet; i++){
                chans = lines[3+i].split(" ").map(Number);
                tetrodes[i] = chans.slice(1,chans[0]+1); 
            }
            var all_channels = tetrodes.map(function(x) {return x}).join(",");

            var nsess = lines[ntet+3].split(" ");
            var sessions = {};
            for (var i = 0; i < nsess; i++){
                sessions[i+1] = lines[4+ntet+i].split(" "); 
            }

            var spike_sign=0;
            var adjacency_radius=100;

            tree = {
                num_channels,
                all_channels,
                dtype,
                resolution,
                samplerate,
                eeg,
                ntet,
                refchan,
                ntet,
                tetrodes,
                sessions,
                dtype,
                spike_sign,
                adjacency_radius
            }

            callback(null,tree);
        });
    },
    read_write: function writeParJSON(inputFile, outputFile=inputFile+'.json', cb) {
        this._read(inputFile, function (err,data) {
            fs.writeFile(outputFile, JSON.stringify(data, null, 2), 'utf8', function(err){
                if(err) {console.log("Error");}
            });
        });
        cb();
    }
}

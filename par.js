const fs = require('fs');
module.exports = {
    read: function readPar(inputFile, callback) {
        fs.readFile(inputFile, 'ascii', function(err, data) {
            if(err) {
                callback(err);
            }
            lines = data.split('\n');
            
            var [nchans,dtype]    = lines[0].split(" ");
            var [resolution, eeg] = lines[1].split(" ");
            var [ntet,  refchan]  = lines[2].split(" ");
            var samplerate        = parseInt((1/resolution)*1000000);

            ntet = Number(ntet)
            var tetrodes = [];
            var chans
            for (let i = 0; i < ntet; i++){
                chans = lines[3+i].split(" ").map(Number);
                tetrodes[i] = chans.slice(1,chans[0]+1); 
            }

            var nsess = lines[ntet+3].split(" ");
            var sessions = {};
            for (var i = 0; i < nsess; i++){
                sessions[i+1] = lines[4+ntet+i].split(" "); 
            }

            tree = {
                nchans,
                dtype,
                resolution,
                samplerate,
                eeg,
                ntet,
                refchan,
                ntet,
                tetrodes,
                sessions
            }

            callback(null,tree);
        });
    },
    read_write: function writeParJSON(inputFile, outputFile=inputFile+'.json', cb) {
        this.read(inputFile, function (err,data) {
            fs.writeFile(outputFile, JSON.stringify(data, null, 2), 'utf8', function(err){
                if(err) {console.log("Error");}
            });
        });
        cb();
    }
}

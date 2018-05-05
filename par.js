const fs = require('fs');
module.exports = {
    readPar: function readPar(inputFile, callback) {
        fs.readFile(inputFile, 'ascii', function(err, data) {
            if(err) {
                callback(err);
            }
            lines = data.split('\n');
            
            var [nchans,dtype]   = lines[0].split(" ");
            var [srate, eeg]     = lines[1].split(" ");
            var [ntet,  refchan] = lines[2].split(" ");
            ntet = Number(ntet)
            var tetrodes = [];
            var chans
            for (let i = 0; i < ntet; i++){
                chans = lines[3+i].split(" ").map(Number);
                tetrodes[i] = chans.slice(1,chans[0]+1); 
            }

            var nsess = lines[15].split(" ");
            var sessions = {};
            for (var i = 0; i < nsess; i++){
                sessions[i+1] = lines[4+ntet+i].split(" "); 
            }

            tree = {
                nchans,
                dtype,
                srate,
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
    writePar: function writeParJSON(inPutFile) {
        tree = readPar(inputFile);
        fs.writeFile(inputFile+'.json', JSON.stringify(tree), 'utf8', function(err,data){
            if(err) {console.log("Error");}
        });
    }
}

#!/usr/bin/nodejs

spec = {
    "processors": [
        {
            "name": "dd.getchannels",
            "exe_command": "nodejs " + __dirname + "/getchannels.js",
            "version": 0.11,
            "inputs": [],
            "outputs": [{"name":"data/channels.csv", "optional":true}],
            "parameters": [],
            "opts": {"force_run":true}
        },{
            "name": "dd.getgeomcsv",
            "exe_command": "nodejs " + __dirname + "/getgeomcsv.js",
            "version": 0.2,
            "inputs": [],
            "outputs": [{"name":"data/geom.csv", "optional":true}], 
            "parameters": [],
            "opts": {"force_run":true}
        },{
            "name": "dd.par2param",
            "exe_command": "nodejs " + __dirname + "/par2param.js",
            "version": 0.1,
            "inputs": [{"name":"inputParFile", "optional":false}],
            "outputs": [{"name":"outputJSONFile", "optional":false}], 
            "parameters": [],
            "opts": {"force_run":true}
        },{
            "name": "dd.make_tmp_datasets",
            "exe_command": "nodejs " + __dirname + "/make_tmp_datasets.js" +" $(arguments)",
            "version": 0.121,
            "inputs": [],
            "outputs": [], 
            "parameters": [{"name":"basename", "optional":false},{"name":"tmpdir","optional":false}, {"name":"rawpath", "optional":false},{"name":"rawhost", "optional":false}],
            "opts": {"force_run":true}
        }
    ]
}

console.log(JSON.stringify(spec))

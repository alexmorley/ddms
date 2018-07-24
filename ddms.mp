#!/usr/bin/nodejs

spec = {
    "processors": [
        {
            "name": "dd.getchannels",
            "exe_command": "nodejs " + __dirname + "/js/getchannels.js",
            "version": 0.11,
            "inputs": [],
            "outputs": [{"name":"data/channels.csv", "optional":true}],
            "parameters": [],
            "opts": {"force_run":true}
        },{
            "name": "dd.getgeomcsv",
            "exe_command": "nodejs " + __dirname + "/js/getgeomcsv.js",
            "version": 0.2,
            "inputs": [],
            "outputs": [{"name":"data/geom.csv", "optional":true}], 
            "parameters": [],
            "opts": {"force_run":true}
        },{
            "name": "dd.par2param",
            "exe_command": "nodejs " + __dirname + "/js/par2param.js",
            "version": 0.1,

            "parameters": [],
            "opts": {"force_run":true}
        },{
            "name": "dd.make_tmp_datasets",
            "exe_command": "nodejs " + __dirname + "/js/make_tmp_datasets.js" +" $(arguments)",
            "version": 0.121,
            "inputs": [{"name":"rawpaths","optional":false}],
            "outputs": [{"name":"params","optional":true}], //,{"name":"tmppath","optional":false}], 
            "parameters": [
                {"name":"basename", "optional":false},
                {"name":"rawhost", "optional":false},
                {"name":"tmpdir", "optional":false}
            ],
            "opts": {"force_run":true}
        }
    ]
}

console.log(JSON.stringify(spec))

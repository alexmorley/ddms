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
},
        {
            "name": "dd.getgeomcsv",
            "exe_command": "nodejs " + __dirname + "/getgeomcsv.js",
            "version": 0.2,
            "inputs": [],
            "outputs": [{"name":"data/geom.csv", "optional":true}], 
            "parameters": [],
"opts": {"force_run":true}
    }
]
}

console.log(JSON.stringify(spec))

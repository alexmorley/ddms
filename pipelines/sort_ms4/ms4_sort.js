#!/usr/bin/env node

const MLClient = require('mlclient').v1;
const path = require('path');
const fs = require('fs');

try {
  main();
} catch (err) {
  console.error(err);
  console.error(err.message);
}

// main
async function main() {
  const MLC = new MLClient();

  // Settings
  var mouse_id   = 'am10'
  var dataset_id = 'am10-170214';
  var temp_dir   = '/spiketmp/datasets/' + dataset_id +'/';
  var proc_dir   = '/mnfs/vtad3/data/amorley_proc/';
  var raw_dir    = '/mnfs/vtad3/data/amorley_raw/' +mouse_id + '/' + dataset_id + '/';

  let default_params={ // These will be overwritten if present in params.json
    freq_min: 300,
    freq_max: 6000,
    samplerate: 20000,
    adjacency_radius: 4,
    detect_sign: -1,
    detect_threshold: 3
  };

  // Set Up
  mkdir_if_needed(temp_dir);
  mkdir_if_needed(temp_dir + 'data');
  mkdir_if_needed(temp_dir + 'output');

  await get_params(dataset_id, temp_dir, proc_dir);    
  var params = JSON.parse(fs.readFileSync(temp_dir + 'params.json'))

  // Prepare Dataset for Sorting
  await prepare_dataset(MLC, dataset_id, temp_dir, raw_dir, params);
  await MLC.run();
  let sort_params = Object.assign(default_params, params);

  // Do Sorting
  await mountainsort4(  MLC, temp_dir + 'data', temp_dir + 'output', sort_params);

  // Do some file conversions for convenience
  await convert_firings(MLC, temp_dir + 'output', sort_params, temp_dir, proc_dir, dataset_id);
  await split_firings(MLC, temp_dir + 'output', sort_params, temp_dir, proc_dir, dataset_id);
}

async function split_firings(MLC, output_dirname, params, temp_dir, proc_dir, dataset_id) {
  for (tet = 1; tet < params.tetrodes.length+1; tet++) {
    var process = {
      processor_name: 'dd.split_firings',
      inputs: {
        res_fname: output_dirname + 'res.' + tet, 
        clu_fname: output_dirname + 'clu.' + tet, 
        params: temp_dir + 'params.json'
      },
      outputs: {
        res_fnames: [dataset_id+'_01'+'.res.'+tet,dataset_id+'_02'+'.res.'+tet],
        clu_fnames: [dataset_id+'_01'+'.clu.'+tet,dataset_id+'_02'+'.clu.'+tet]
      },
      parameters: {
        tetrode: tet
      },
      opts: {}
    }
    MLC.addProcess(process);  
    await MLC.run();
  }
}
function get_params(dataset_id, temp_dir, proc_dir) {
  // Copy the par file there
  var tmp_par_path =  path.join(temp_dir, dataset_id + '.par');
  if (!(fs.existsSync(tmp_par_path))) {
    fs.copyFileSync(proc_dir + dataset_id + '/' + dataset_id+'.par', tmp_par_path);
  };
  // Convert to params.json
  // Convert the par file to params.json
  var Par = require('../../js/par.js');
  return new Promise (resolve=> {
    Par.read_write(tmp_par_path, temp_dir + 'params.json', function (err) { 
      if(err) {
        console.log("Error reading par file");
      }
      resolve();
    })
  });
}

async function prepare_dataset(MLC, dataset_id, temp_dir, raw_dir, params) { 
  // Copy from raw (using rsync in necessary)
  var process = {
    processor_name: 'dd.make_tmp_datasets',
    inputs: {
      rawpaths: [raw_dir+dataset_id+'_01.dat', raw_dir+dataset_id+'_02.dat'], //!!!!!
    },
    outputs: {
        //params: temp_dir + 'params.json'
      },
      parameters: {
        basename: dataset_id,
        tmpdir: '/'+temp_dir.split(path.sep)[1],
        rawhost: 'data@vta'
      },
      opts: {}
    }
  console.log(process);
  MLC.addProcess(process);

  // Concatenate Raw
  var process = {
    processor_name: 'ephys.convert_array',
    inputs: {
      input: [temp_dir+dataset_id+'_01.dat', temp_dir+dataset_id+'_02.dat'], //!!!!!
    },
    outputs: {
      output: temp_dir + 'data/raw.mda'
    },
    parameters: {
      channels: params['all_channels'],
      dtype:'int16',
      dimensions: '58,-1' //!!!!!
    },
    opts: {}
  }
  console.log(process);
  MLC.addProcess(process);
}

// mountainsort4
async function mountainsort4(MLC, dataset_dirname, output_dirname, params) {
  let raw = `${dataset_dirname}/raw.mda`;
  let filt = `${output_dirname}/filt.mda.prv`;
  let pre = `${output_dirname}/pre.mda.prv`;
  let firings = `${output_dirname}/firings.mda`;

  let filter_params={
    freq_min:params.freq_min,
    freq_max:params.freq_max,
    samplerate:params.samplerate
  };

  let sort_params={
    adjacency_radius:params.adjacency_radius,
    detect_threshold:params.detect_threshold,
    detect_sign:params.detect_sign
  };

  bandpass_filter(MLC, raw, filt, filter_params);
  whiten(MLC, filt, pre, {});
  ms4alg_sort(MLC, pre, {}, firings, sort_params);
  await MLC.run();
}

async function convert_firings(MLC, output_dirname, params, temp_dir, proc_dir, dataset_id) {
  for (tet = 1; tet < params.tetrodes.length+1; tet++) {
    MLC.addProcess({
      processor_name: 'dd.convert_firings',
      inputs: {
        firings: output_dirname + '/firings.mda',
        params: temp_dir + 'params.json'
      },
      outputs: {
        res_fname: proc_dir + dataset_id +'/' + dataset_id + '.res.' + tet,
        clu_fname: proc_dir + dataset_id +'/' + dataset_id + '.clu.' + tet
      },
      parameters: {
        tetrode:tet
      }
    })
    await MLC.run(); // Should to be able to call after but race condition on database write.
  };
}


function bandpass_filter(MLC, timeseries, timeseries_out, params) {
  MLC.addProcess({
    processor_name: 'ephys.bandpass_filter',
    inputs: {
      timeseries: timeseries
    },
    outputs: {
      timeseries_out: timeseries_out
    },
    parameters: params,
    opts: {}
  });
}

function whiten(MLC, timeseries, timeseries_out, params) {
  MLC.addProcess({
    processor_name: 'ephys.whiten',
    inputs: {
      timeseries: timeseries
    },
    outputs: {
      timeseries_out: timeseries_out
    },
    parameters: params,
    opts: {}
  });
}

function ms4alg_sort(MLC, timeseries, geom, firings_out, params) {
  MLC.addProcess({
    processor_name: 'ms4alg.sort',
    inputs: {
      timeseries: timeseries,
      geom: geom
    },
    outputs: {
      firings_out: firings_out
    },
    parameters: params,
    opts: {}
  });
}

function mkdir_if_needed(dirname) {
  if (!require('fs').existsSync(dirname))
    require('fs').mkdirSync(dirname);
}

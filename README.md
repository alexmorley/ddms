# ddms
Utils for Using MountainLab

To run sorting.

Make datasets folder and add (or link) dat file.
```
mkdir -p datasets
mkdir -p ds1
mv mydat.dat datasets/ds1
```

convert .par file to params.json
```
nodejs par2param.js am9-160528.par dataset/am9/params.json
```

(start lari in a seperate terminal)
```
LARI_LISTEN_PORT=* ml-lari-start
```

Run Sorting Pipeline
```
mls-run ~/.mountainlab/packages/ddms/sort_dataset.ml --datasets=dataset/ --results=output
```

View Templates
```
ev-view-templates output/ds1/templates.mda.prv
```

View Raw Data with Spike Times
```
ev-view-timeseries --firings output/am9/firings.mda.prv output/am9/raw.mda.prv
```

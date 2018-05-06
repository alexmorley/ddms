import numpy as np

from mltools import mdaio
from timeserieschunkreader import TimeseriesChunkReader

processor_name='ephys.compute_templates_spk'
processor_version='0.01'
def compute_templates_spk(*,timeseries,firings,templates_out,clip_size=100):
    """
    Compute templates (average waveforms) for clusters defined by the labeled events in firings. One .spk.n file per n-trode.

    Parameters
    ----------
    timeseries : INPUT
        Path of timeseries mda file (MxN) from which to draw the event clips (snippets) for computing the templates. M is number of channels, N is number of timepoints.
    firings : INPUT
        Path of firings mda file (RxL) where R>=3 and L is the number of events. Second row are timestamps, third row are integer labels.
    params : INPUT
        params.json file. Needed to see number of channels per tetrode.
        
    templates_out : OUTPUT
        Base Path (MxTxK). T=clip_size, K=maximum cluster label. Note that empty clusters will correspond to a template of all zeros. 
        
    clip_size : int
        (Optional) clip size, aka snippet size, number of timepoints in a single template
    """    
    templates=compute_templates_helper(timeseries=timeseries,firings=firings,clip_size=clip_size)
    return mdaio.writemda32(templates,templates_out)
    
# Same as compute_templates, except return the templates as an array in memory
def compute_templates_helper(*,timeseries,firings,clip_size=100):
    X=mdaio.DiskReadMda(timeseries)
    M,N = X.N1(),X.N2()
    F=mdaio.readmda(firings)
    L=F.shape[1]
    L=L
    T=clip_size
    Tmid = int(np.floor((T + 1) / 2) - 1);
    whch=F[0,:].ravel()
    times=F[1,:].ravel()
    labels=F[2,:].ravel().astype(int)
    K=np.max(labels)

    sums=np.zeros((M,T,K),dtype='float64')
    counts=np.zeros(K)

    tetmap=[
    skipped_clips = 0
    waveforms=np.zeros(M,T,len(times))
    for ch in channels:
        
        for ti in times: # for each spike
            t0=int(ti)
            #if (clip_size<=t0) and (t0<N-clip_size):
            clip0=X.readChunk(i1=0,N1=M,i2=t0-Tmid,N2=T)
            waveforms[:,:,i] = clip0
            #i+=1
            #else:
            #    skipped_clips+=1
    
    return waveforms

compute_templates.name=processor_name
compute_templates.version=processor_version

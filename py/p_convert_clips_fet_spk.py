import numpy as np
from sklearn import decomposition
from sklearn.preprocessing import StandardScaler

from mountainlab_pytools import mdaio
from timeserieschunkreader import TimeseriesChunkReader

processor_name='dd.convert_clips_fet_spk'
processor_version='0.01'


#timeseries='/tmp/mountainlab-tmp/output_d468ac4041de2645c7ae6f801daea945aabf5b12_timeseries_out.mda'
#firings='/tmp/mountainlab-tmp/output_0454d0e46a65c78c5f4b2d9093a06f85530a2ab5_firings_out'
#waveforms_out='/home/amorley/data/am9-160528/output/am9-160528'
#clip_size=32
#ntro_nchannels = ','.join('4' for _ in np.arange(0,12))

def convert_clips_fet_spk(*,timeseries,firings,waveforms_out,ntro_nchannels,clip_size=32,nPC=4,DEBUG=True):
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
        
    ntro_nchannels : INPUT
        Comma-seperated determining the number of channels should be taken for each ntrode.
        
    waveforms_out : OUTPUT
        Base Path (MxTxK). T=clip_size, K=maximum cluster label. Note that empty clusters will correspond to a template of all zeros. 
        
    clip_size : int
        (Optional) clip size, aka snippet size, number of timepoints in a single template
    
    nPC : int
        (Optional) Number of principal components *per channel* for .fet files.
        
    DEBUG : bool
        (Optional) Verbose output for debugging purposes.
    """    
    X=mdaio.DiskReadMda(timeseries)
    M,N = X.N1(),X.N2()
    F=mdaio.readmda(firings)
    L=F.shape[1]
    L=L
    T=clip_size
    Tmid = int(np.floor((T + 1) / 2) - 1);
    whch=F[0,:].ravel()[:]
    times=F[1,:].ravel()[:]
    labels=F[2,:].ravel().astype(int)[:]
    K=np.max(labels)

    tetmap = list()
    i = 0
    for nch in ntro_nchannels.split(','):
        tp = i + 1 + np.arange(0,int(nch))
        tetmap.append(tp)
        i=tp[-1]
    which_tet = [np.where(w==tetmap)[0][0]+1 for w in whch]
    
    print("Starting:")
    for tro in np.arange(1,12):
        chans = tetmap[tro-1]
        inds_k=np.where(which_tet==tro)[0]
        
        ###### Write .res file ######
        res = times[inds_k]
        res_fname = firings_out + '.res.' + tro
        np.savetxt(res_fname, times, fmt='%d')
        
        labels_tet   = labels[inds_k]
        u_labels_tet = np.unique(labels_tet)
        K            = len(u_labels_tet)
        u_new_labels = np.argsort(u_labels_tet).argsort()+2
        new_labels   = [u_new_labels[(l == np.array(u_labels_tet)).argmax()] for l in labels_tet]
        clu_fname    = firings_out + '.clu.' + tro
        np.savetxt(clu_fname, np.concatenate((np.array([K]),new_lables)), fmt='%d')

        if DEBUG:
            print("Tetrode: "+str(tro))
            print("Chans: "+str(chans))
            print("Create Waveforms Array: "+str(len(chans))+","+str(T)+","+str(len(inds_k)))
        
        waveforms = np.zeros((len(chans),T,len(inds_k)),dtype='int16')
        for i,ind_k in enumerate(inds_k): # for each spike
            t0=int(times[ind_k])
            if (clip_size<=t0) and (t0<N-clip_size):
                clip0=X.readChunk(i1=0,N1=M,i2=t0-Tmid,N2=T)
                clip0=clip0[chans,:]*100
                clip_int = clip0.astype(dtype='int16')
                waveforms[:,:,i] = clip_int

        fname=waveforms_out+'.spk.'+str(tro)
        if DEBUG:
            print("Writing Waveforms to File: "+ fname)
        waveforms.tofile(fname, format='')
    
        if DEBUG:
            print("Calculating Feature Array")
        fet = np.zeros((np.shape(waveforms)[2],(len(chans)*nPC)+1))
        for c in np.arange(len(chans)):
            pca   = decomposition.PCA(n_components=nPC)
            x_std = StandardScaler().fit_transform(np.transpose(waveforms[c,:,:]).astype(dtype='float64'))
            fpos  = (c*nPC)
            fet[:,fpos:fpos+4]   = pca.fit_transform(x_std)

        fet[:,(len(chans)*nPC)] = times[inds_k]
        fet *= 1000
        fet.astype(dtype='int64')
        fname=waveforms_out+'.fet.'+str(tro)
        if DEBUG:
            print("Writing Features to File: "+ fname)
        np.savetxt(fname, fet, fmt='%d')
            
    return True

convert_clips_fet_spk.name=processor_name
convert_clips_fet_spk.version=processor_version

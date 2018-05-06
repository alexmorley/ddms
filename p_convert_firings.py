import numpy as np

from mltools import mdaio

processor_name='dd.convert_firings'
processor_version='0.01'
def convert_firings(*,firings,firings_out):
    """
    Export firings (either .mda or .npy) .res & .clu format.

    Parameters
    ----------
    firings : INPUT
        Path of firings mda (or npy) file (RxL) where R>=3 and L is the number of events. Second row are timestamps, third row are integer labels.    
        
    firings_out : OUTPUT
        Path of output filebase. Actual output files will be $(firings_out).res & $(firings_out).clu.
    """    

    F=mdaio.readmda(firings)
    L=F.shape[1] # Number of Spike Times 
    times=F[1,:].ravel() # Spike Times
    labels=F[2,:].ravel().astype(int) # Cluster IDs
    K=np.max(labels) # Number of clusters

    res_fname = firings_out + '.res'
    clu_fname = firings_out + '.clu'
    np.savetxt(res_fname, times, fmt='%d')
    np.savetxt(clu_fname, np.concatenate((np.array([K]),times)), fmt='%d')

    return True

convert_firings.name=processor_name
convert_firings.version=processor_version

import numpy as np
import json
from mountainlab_pytools import mdaio

processor_name='dd.convert_firings'
processor_version='0.03'
def convert_firings(*,firings,params,res_fname,clu_fname,tetrode):
    """
    Export firings (either .mda or .npy) to .res & .clu format.

    Parameters
    ----------
    firings : INPUT
        Path of firings mda (or npy) file (RxL) where R>=3 and L is the number of events. Second row are timestamps, third row are integer labels.    
     
    params : INPUT
        params_json including channel map for tetrode.
   
    res_fname : OUTPUT
        Path of output spike times .res file.

    clu_fname : OUTPUT
        Path of output spike ids .clu file.

    tetrode : int
        Which tetrode to write out firings for.

    """    

    F=mdaio.readmda(firings)
    L=F.shape[1]
    L=L
    whch=F[0,:].ravel()[:]
    times=F[1,:].ravel()[:]
    labels=F[2,:].ravel().astype(int)[:]
    K=np.max(labels)
    
    with open(params, 'r') as fp:
            params_obj = json.load(fp)

    tetmap = []
    pre = 1
    for i,x in enumerate(params_obj['tetrodes']):
        tetmap.append(list(range(pre,pre+len(x))))
        pre += len(x)
        
    which_tet = np.array([np.where(w==tetmap)[0][0]+1 for w in whch])
    inds_k=np.where(which_tet==int(tetrode))[0]
    
    ###### Write .res file ######
    res = times[inds_k]
    np.savetxt(res_fname, res, fmt='%d')
    
    labels_tet   = labels[inds_k]
    u_labels_tet = np.unique(labels_tet)
    K            = len(u_labels_tet)
    u_new_labels = np.argsort(u_labels_tet).argsort()+2
    new_labels   = [u_new_labels[(l == np.array(u_labels_tet)).argmax()] for l in labels_tet]
    np.savetxt(clu_fname, np.concatenate((np.array([K+1]),new_labels)), fmt='%d')

    return True

convert_firings.name=processor_name
convert_firings.version=processor_version

import numpy as np
import json
from mountainlab_pytools import mdaio

processor_name='dd.split_firings'
processor_version='0.01'
def split_firings(*,res_fname,clu_fname,resofs,params,res_fnames,clu_fnames,tetrode):
    """
    Split .res & .clu format "master" firings file into per_session files.

    Parameters
    ----------
    res_fname : INPUT
        Path of .res.t file

    clu_fname : INPUT
        Path of .clu.t file.

    resofs : INPUT
        Path of .resofs file (list of session end timepoints).

    params : INPUT
        params_json including channel map for tetrode.
   
    res_fnames : OUTPUT
        Array of output spike times _ses.res.t files.

    clu_fnames : OUTPUT
        Array of output spike ids _ses.clu.t files.

    tetrode : int
        Which tetrode to write out firings for.

    """    

    with open(params, 'r') as fp:
            params_obj = json.load(fp)

    res    = np.loadtxt(res_fname, dtype=int)
    clu_   = np.loadtxt(clu_fname, dtype=int)
    K      = clu_[0]
    clu    = clu_[1:]
    resofs = np.loadtxt(resofs, dtype=int)

    start = 0
    for (i,ses_off) in enumerate(resofs):
        inds = (res>start) & (res<ses_off)
        res_ses = res[inds]
        clu_ses = clu[inds]
        np.savetxt(res_fnames[i],res_ses,fmt='%d')
        np.savetxt(clu_fnames[i],\
                np.concatenate((np.array([K+1]),clu_ses)),fmt='%d')
        start   = ses_off

    return True

split_firings.name=processor_name
split_firings.version=processor_version

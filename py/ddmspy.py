import sys

from mltools import processormanager as pm

import p_convert_firings
import p_convert_clips_fet_spk

PM=pm.ProcessorManager()

PM.registerProcessor(p_convert_firings.convert_firings)
PM.registerProcessor(p_convert_clips_fet_spk.convert_clips_fet_spk)


if not PM.run(sys.argv):
    exit(-1)

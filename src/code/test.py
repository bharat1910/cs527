import numpy as np
import matplotlib.pyplot as plt
import os

path = '/home/anusha/Desktop/cs527/error_summary'

def readFileAndShowChart():
    bugCountByToolAndProject = []
    
    for toolFolder in os.listdir(path):
        for fname in os.listdir(path + '/' + toolFolder):
            f = open(path + '/' + toolFolder + '/' + fname)
            count = 0
            for line in f.readlines():
                count += int(line.rsplit(' ', 1)[1])
            bugCountByToolAndProject.append(count);

    print bugCountByToolAndProject[0:5]
    
readFileAndShowChart();
import numpy as np
import matplotlib.pyplot as plt
import os

path = '/home/anusha/Desktop/cs527/error_summary'

def readFileAndShowChart():
    bugCountByToolAndProject = []
    projectNames = []
    toolNames = []
    
    for toolFolder in os.listdir(path):
        toolNames.append(toolFolder)
        
        for fname in os.listdir(path + '/' + toolFolder):
            projectNames.append('         ' + fname)
            f = open(path + '/' + toolFolder + '/' + fname)
            count = 0
            
            for line in f.readlines():
                count += int(line.split(' ')[0])
            bugCountByToolAndProject.append(count);

    fig = plt.figure()
    ax = fig.add_subplot(111)
    width = 0.2
    ind = np.arange(5) 

    rects1 = ax.bar(ind, bugCountByToolAndProject[0:5], width, color='black')
    rects2 = ax.bar(ind+width, bugCountByToolAndProject[5:10], width, color='red')
    rects3 = ax.bar(ind+width+width, bugCountByToolAndProject[10:15], width, color='blue')
    
    # axes and labels
    ax.set_ylabel('Faults')
    ax.set_title('Faults by projects and tools')
    ax.set_xticks(ind+width)
    xtickNames = ax.set_xticklabels(projectNames)
    plt.setp(xtickNames, fontsize=10)

    ## add a legend
    ax.legend( (rects1[0], rects2[0], rects3[0]), toolNames )
    
    plt.show()
    
    
readFileAndShowChart();
import numpy as np
import matplotlib.pyplot as plt
import os

path = '/home/anusha/Desktop/cs527/error_summary/jshint/summary/summary.txt'

def readFileAndShowChart():
    bugCountByTool = []
    
    error_number = 0;
    figsize = (18,8)
    fig = plt.figure(figsize = figsize)
    ax = fig.add_subplot(111)
    width = 0.2 
    f = open(path)
    for line in f.readlines():
        count = int(line.split(' ')[0])
        bugCountByTool.append(count);

        error_number = error_number + 1        
        print str(error_number) + ": " + line.split(' ', 1)[1]

    ind = np.arange(1, len(bugCountByTool) + 1)
    rects1 = ax.bar(ind, bugCountByTool, width, color='red')
        
    # axes and labels
    ax.set_ylabel('Fault count')
    ax.set_xticks(ind+width)
    xtickNames = ax.set_xticklabels(ind)
    plt.setp(xtickNames, fontsize=10)
    
    plt.show()
  
    
readFileAndShowChart();
/* jshint undef: false, unused: false, asi: true */
$(function () {
    $('#container').highcharts({

	    chart: {
	        type: 'pie'
	    },
	    
	    title: {
	    	text: 'Pie chart on highstock.js'
	    },
	
	    series: [{
	        data: [1,3,2,4]
	    }]
    });
 });

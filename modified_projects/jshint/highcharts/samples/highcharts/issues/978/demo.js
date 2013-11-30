/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
    $('#container').highcharts({

	    chart: {
	    },
	
	    yAxis: {
	        type: 'logarithmic',
	        min: 1
	    },
	
	    series: [{
	        data: [null, null, null]
	    }]
	
	});
});

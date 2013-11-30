/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        plotBorderWidth: 1
	    },
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    yAxis: {
	    	startOnTick: false,
	    	endOnTick: false
	    },
	    
	    series: [{
	        name: 'USD to EUR',
	        data: usdeur
	    }]
	});
});

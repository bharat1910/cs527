/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
		yAxis: {
			minorGridLineColor: '#F0F0F0',
			minorTickInterval: 'auto'
		},
	    
	    series: [{
	        name: 'USD to EUR',
	        data: usdeur
	    }]
	});
});

/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        ignoreHiddenSeries: false 
	    },
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    legend: {
	    	enabled: true
	    },
	    
	    series: [{
	        name: 'GOOGL',
	        data: GOOGL
	    }, {
	        name: 'MSFT',
	        data: MSFT
	    }]
	});
});

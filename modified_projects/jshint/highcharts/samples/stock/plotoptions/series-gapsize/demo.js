/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    plotOptions: {
	    	line: {
	    		gapSize: 2
	    	}
	    },
	    
	    series: [{
	        name: 'USD to EUR',
	        data: usdeur
	    }]
	});
});

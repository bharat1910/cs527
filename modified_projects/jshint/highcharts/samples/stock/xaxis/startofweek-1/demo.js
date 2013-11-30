/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        width: 800
	    },
	    
	    xAxis: {
	    	dateTimeLabelFormats: {
	    		week: '%a,<br/>%e. %b'
	    	},
	    	// startOfWeek: 1, // by default
	    	tickPixelInterval: 70	    	
	    },
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    series: [{
	        name: 'USD to EUR',
	        data: usdeur
	    }]
	});
});

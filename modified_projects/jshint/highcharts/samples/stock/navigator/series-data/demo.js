/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    navigator: {
	    	series: {
	    		data: ADBE	
	    	}
	    },
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    series: [{
	        name: 'MSFT',
	        data: MSFT
	    }]
	});
});

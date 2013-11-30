/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	
	Highcharts.setOptions({
	    chart: {
	        style: {
	            fontFamily: 'serif'
	        }
	    }
	});
	
	$('#container').highcharts('StockChart', {
	    
	    chart: {
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

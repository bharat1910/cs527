/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        borderWidth: 2,
	        marginTop: 100
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

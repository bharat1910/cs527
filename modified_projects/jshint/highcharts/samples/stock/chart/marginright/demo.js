/* jshint undef: false, unused: false, asi: true */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        borderWidth: 2,
	        marginRight: 100
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

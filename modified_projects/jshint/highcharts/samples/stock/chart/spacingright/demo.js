/* jshint undef: false, unused: false, asi: true */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
        	borderWidth: 1,
        	plotBorderWidth: 1,
        	spacingRight: 100
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

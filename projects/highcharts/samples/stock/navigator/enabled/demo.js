$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    navigator: {
	    	enabled: false
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
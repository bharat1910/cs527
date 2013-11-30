/* jshint undef: false, unused: false, asi: true */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	        events: {
	        	load: function() {
	        		alert ('Chart has loaded');
	        	}
	        }
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

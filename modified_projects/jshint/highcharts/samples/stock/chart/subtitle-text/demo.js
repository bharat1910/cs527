/* jshint undef: true, unused: true */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    title: {
	    	text: 'The title'
	    },
	    
	    subtitle: {
        	text: 'The subtitle'
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

/* jshint undef: true, unused: true */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    title: {
	    	text: 'This is the chart title',
        	align: 'right',
        	x: -10,
        	verticalAlign: 'bottom',
        	y: -100
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
/* jshint undef: false, unused: false, asi: true */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    yAxis: {
			minorGridLineWidth: 0,
			minorTickInterval: 'auto',
			minorTickColor: '#000000',
			minorTickWidth: 1,
			minorTickLength: 10,
			minorTickPosition: 'inside'
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

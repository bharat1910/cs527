/* jshint undef: true, unused: true */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    plotOptions: {
	    	candlestick: {
	    		color: 'blue',
	    		upColor: 'red'
	    	}
	    },
	    
	    rangeSelector: {
	    	selected: 1
	    },
	    
	    series: [{
	    	type: 'candlestick',
	        name: 'USD to EUR',
	        data: ohlcdata
	    }]
	});
});

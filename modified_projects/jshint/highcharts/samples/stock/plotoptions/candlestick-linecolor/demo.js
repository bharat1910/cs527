/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {
	    
	    chart: {
	    },
	    
	    plotOptions: {
	    	candlestick: {
	    		lineColor: '#2f7ed8',	    		
	    		upLineColor: 'silver', // docs
	    		upColor: 'silver'
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

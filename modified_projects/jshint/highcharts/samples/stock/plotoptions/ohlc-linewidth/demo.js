/* jshint undef: false, unused: false, asi: true */
/* jshint maxerr:10000 */
$(function() {
	$('#container').highcharts('StockChart', {

	    title: {
	    	text: 'plotOptions: {ohlc: {lineWidth: 3}}'
	    },

	    plotOptions: {
	    	ohlc: {
	    		lineWidth: 3
	    	}
	    },

	    rangeSelector: {
	    	selected: 1
	    },

	    series: [{
	    	type: 'ohlc',
	        name: 'USD to EUR',
	        data: ohlcdata
	    }]
	});
});
